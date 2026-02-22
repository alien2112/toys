<?php

class Inventory {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create stock reservation
     */
    public function createReservation($productId, $userId, $quantity, $expiresInMinutes = 30) {
        $stmt = $this->db->prepare(
            "INSERT INTO inventory_reservations (product_id, user_id, quantity, expires_at) 
             VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))"
        );
        return $stmt->execute([$productId, $userId, $quantity, $expiresInMinutes]);
    }

    /**
     * Get active reservations for a product
     */
    public function getActiveReservations($productId) {
        $stmt = $this->db->prepare(
            "SELECT * FROM inventory_reservations 
             WHERE product_id = ? AND status = 'active' AND expires_at > NOW()"
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    /**
     * Get user's reservations
     */
    public function getUserReservations($userId) {
        $stmt = $this->db->prepare(
            "SELECT ir.*, p.name as product_name, p.image_url 
             FROM inventory_reservations ir
             JOIN products p ON ir.product_id = p.id
             WHERE ir.user_id = ? AND ir.status = 'active' AND ir.expires_at > NOW()
             ORDER BY ir.expires_at ASC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Convert reservation to order
     */
    public function convertReservation($reservationId, $orderId) {
        $stmt = $this->db->prepare(
            "UPDATE inventory_reservations 
             SET status = 'converted', order_id = ? 
             WHERE id = ? AND status = 'active'"
        );
        return $stmt->execute([$orderId, $reservationId]);
    }

    /**
     * Expire old reservations
     */
    public function expireReservations() {
        $stmt = $this->db->prepare(
            "UPDATE inventory_reservations 
             SET status = 'expired' 
             WHERE status = 'active' AND expires_at <= NOW()"
        );
        return $stmt->execute();
    }

    /**
     * Record inventory movement
     */
    public function recordMovement($productId, $movementType, $quantity, $referenceType = null, $referenceId = null, $reason = null, $userId = null) {
        $stmt = $this->db->prepare(
            "INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, reason, user_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        return $stmt->execute([$productId, $movementType, $quantity, $referenceType, $referenceId, $reason, $userId]);
    }

    /**
     * Get inventory movements for a product
     */
    public function getMovements($productId, $limit = 50) {
        $stmt = $this->db->prepare(
            "SELECT im.*, u.first_name, u.last_name 
             FROM inventory_movements im
             LEFT JOIN users u ON im.user_id = u.id
             WHERE im.product_id = ?
             ORDER BY im.created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$productId, $limit]);
        return $stmt->fetchAll();
    }

    /**
     * Get low stock alerts
     */
    public function getLowStockAlerts($threshold = 10) {
        $stmt = $this->db->prepare(
            "SELECT p.*, COALESCE(lsa.threshold, ?) as alert_threshold
             FROM products p
             LEFT JOIN low_stock_alerts lsa ON p.id = lsa.product_id
             WHERE p.is_active = 1 AND p.stock <= COALESCE(lsa.threshold, ?)
             ORDER BY p.stock ASC"
        );
        $stmt->execute([$threshold, $threshold]);
        return $stmt->fetchAll();
    }

    /**
     * Create or update low stock alert
     */
    public function setLowStockAlert($productId, $threshold) {
        $stmt = $this->db->prepare(
            "INSERT INTO low_stock_alerts (product_id, current_stock, threshold, alert_sent) 
             VALUES (?, (SELECT stock FROM products WHERE id = ?), ?, 0)
             ON DUPLICATE KEY UPDATE 
             threshold = ?, current_stock = (SELECT stock FROM products WHERE id = ?), alert_sent = 0"
        );
        return $stmt->execute([$productId, $productId, $threshold, $threshold, $productId]);
    }

    /**
     * Get available stock (total stock - active reservations)
     */
    public function getAvailableStock($productId) {
        $stmt = $this->db->prepare(
            "SELECT p.stock - COALESCE(SUM(ir.quantity), 0) as available
             FROM products p
             LEFT JOIN inventory_reservations ir ON p.id = ir.product_id 
                 AND ir.status = 'active' 
                 AND ir.expires_at > NOW()
             WHERE p.id = ?
             GROUP BY p.id, p.stock"
        );
        $stmt->execute([$productId]);
        $result = $stmt->fetch();
        return $result ? (int)$result['available'] : 0;
    }

    /**
     * Batch update inventory
     */
    public function batchUpdate($updates) {
        $this->db->beginTransaction();
        
        try {
            foreach ($updates as $update) {
                $productId = $update['product_id'];
                $newStock = $update['stock'];
                $reason = $update['reason'] ?? 'Manual update';
                
                // Get current stock
                $stmt = $this->db->prepare("SELECT stock FROM products WHERE id = ?");
                $stmt->execute([$productId]);
                $current = $stmt->fetch();
                
                if ($current) {
                    $difference = $newStock - $current['stock'];
                    
                    // Update product stock
                    $stmt = $this->db->prepare("UPDATE products SET stock = ? WHERE id = ?");
                    $stmt->execute([$newStock, $productId]);
                    
                    // Record movement
                    $movementType = $difference > 0 ? 'in' : 'out';
                    $this->recordMovement($productId, $movementType, abs($difference), 'adjustment', null, $reason);
                }
            }
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
}
