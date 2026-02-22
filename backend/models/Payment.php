<?php

require_once __DIR__ . '/../utils/Database.php';

class Payment {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create a new payment record
     */
    public function create($data) {
        $sql = "INSERT INTO payments (order_id, amount, currency, gateway, gateway_ref, status, raw_response) 
                VALUES (:order_id, :amount, :currency, :gateway, :gateway_ref, :status, :raw_response)";
        
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':order_id' => $data['order_id'],
            ':amount' => $data['amount'],
            ':currency' => $data['currency'] ?? 'KWD',
            ':gateway' => $data['gateway'],
            ':gateway_ref' => $data['gateway_ref'] ?? null,
            ':status' => $data['status'] ?? 'pending',
            ':raw_response' => $data['raw_response'] ?? null
        ]) ? $this->db->lastInsertId() : false;
    }

    /**
     * Get payment by ID
     */
    public function getById($id) {
        $sql = "SELECT p.*, o.user_id, o.total_amount as order_amount, o.status as order_status
                FROM payments p 
                LEFT JOIN orders o ON p.order_id = o.id 
                WHERE p.id = :id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update payment
     */
    public function update($id, $data) {
        $fields = [];
        $values = [':id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, ['gateway_ref', 'status', 'raw_response'])) {
                $fields[] = "$key = :$key";
                $values[":$key"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE payments SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute($values);
    }

    /**
     * Get payments by order ID
     */
    public function getByOrderId($orderId) {
        $sql = "SELECT * FROM payments WHERE order_id = :id ORDER BY created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $orderId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get payments by user ID
     */
    public function getByUserId($userId, $limit = 50, $offset = 0) {
        $sql = "SELECT p.*, o.total_amount, o.created_at as order_date
                FROM payments p 
                LEFT JOIN orders o ON p.order_id = o.id 
                WHERE o.user_id = :user_id 
                ORDER BY p.created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get payment statistics
     */
    public function getStatistics($startDate = null, $endDate = null) {
        $sql = "SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as failed_amount,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
                    gateway,
                    currency
                FROM payments";
        
        $params = [];
        
        if ($startDate && $endDate) {
            $sql .= " WHERE created_at BETWEEN :start_date AND :end_date";
            $params[':start_date'] = $startDate;
            $params[':end_date'] = $endDate;
        }
        
        $sql .= " GROUP BY gateway, currency";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Refund payment
     */
    public function refund($id, $amount = null) {
        $payment = $this->getById($id);
        
        if (!$payment || $payment['status'] !== 'completed') {
            return false;
        }

        $refundAmount = $amount ?? $payment['amount'];
        
        // Update payment status to refunded
        return $this->update($id, [
            'status' => 'refunded',
            'raw_response' => json_encode([
                'refund_amount' => $refundAmount,
                'refunded_at' => date('Y-m-d H:i:s'),
                'original_status' => $payment['status']
            ])
        ]);
    }

    /**
     * Get recent payments for admin
     */
    public function getRecentPayments($limit = 10) {
        $sql = "SELECT p.*, o.user_id, u.name as customer_name, u.email as customer_email
                FROM payments p 
                LEFT JOIN orders o ON p.order_id = o.id 
                LEFT JOIN users u ON o.user_id = u.id 
                ORDER BY p.created_at DESC 
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Search payments
     */
    public function search($filters = [], $limit = 50, $offset = 0) {
        $sql = "SELECT p.*, o.user_id, u.name as customer_name, u.email as customer_email
                FROM payments p 
                LEFT JOIN orders o ON p.order_id = o.id 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($filters['status'])) {
            $sql .= " AND p.status = :status";
            $params[':status'] = $filters['status'];
        }
        
        if (!empty($filters['gateway'])) {
            $sql .= " AND p.gateway = :gateway";
            $params[':gateway'] = $filters['gateway'];
        }
        
        if (!empty($filters['customer_name'])) {
            $sql .= " AND u.name LIKE :customer_name";
            $params[':customer_name'] = '%' . $filters['customer_name'] . '%';
        }
        
        if (!empty($filters['date_from'])) {
            $sql .= " AND p.created_at >= :date_from";
            $params[':date_from'] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $sql .= " AND p.created_at <= :date_to";
            $params[':date_to'] = $filters['date_to'];
        }
        
        $sql .= " ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
