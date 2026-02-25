<?php

require_once __DIR__ . '/../utils/Database.php';

class Order {
    public $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($userId, $totalAmount, $shippingAddress, $items, $paymentMethod = 'cash_on_delivery') {
        try {
            $this->db->beginTransaction();

            // Step 1: Lock products and validate stock
            $lockedProducts = [];
            $calculatedTotal = 0;

            foreach ($items as $item) {
                $stmt = $this->db->prepare(
                    "SELECT id, price, stock, name FROM products WHERE id = ? AND is_active = 1 FOR UPDATE"
                );
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    throw new Exception("Product not found: {$item['product_id']}");
                }

                if ($product['stock'] < $item['quantity']) {
                    throw new Exception("Insufficient stock for: " . $product['name']);
                }

                $lockedProducts[] = $product;
                $calculatedTotal += $product['price'] * $item['quantity'];
            }

            // Step 2: Insert the order with payment method
            $stmt = $this->db->prepare(
                "INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status) VALUES (?, ?, ?, ?, ?)"
            );
            $paymentStatus = $paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending';
            $stmt->execute([$userId, $calculatedTotal, $shippingAddress, $paymentMethod, $paymentStatus]);
            $orderId = $this->db->lastInsertId();

            // Step 3: Insert order items and update stock atomically
            $stmt = $this->db->prepare(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)"
            );

            foreach ($items as $index => $item) {
                $product = $lockedProducts[$index];
                
                // Insert order item with DB price
                $stmt->execute([$orderId, $item['product_id'], $item['quantity'], $product['price']]);
                
                // Update stock with conditional check
                $updateStock = $this->db->prepare(
                    "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?"
                );
                $updateStock->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
                
                // Check if the update succeeded (rowCount > 0)
                if ($updateStock->rowCount() === 0) {
                    throw new Exception("Stock depleted for: " . $product['name']);
                }
            }

            $this->db->commit();
            return $orderId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getByUserId($userId) {
        $stmt = $this->db->prepare(
            "SELECT o.*, 
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'product_id', oi.product_id,
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price
                        )
                    ) FROM order_items oi 
                    LEFT JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id) as items
             FROM orders o 
             WHERE o.user_id = ? 
             ORDER BY o.created_at DESC"
        );
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'], true) ?? [];
        }
        
        return $orders;
    }

    public function getById($id) {
        $stmt = $this->db->prepare(
            "SELECT o.*, 
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'product_id', oi.product_id,
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price
                        )
                    ) FROM order_items oi 
                    LEFT JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id) as items
             FROM orders o 
             WHERE o.id = ?"
        );
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        
        if ($order) {
            $order['items'] = json_decode($order['items'], true) ?? [];
        }
        
        return $order;
    }

    public function updateStatus($orderId, $newStatus, $adminId = null, $notes = null) {
        try {
            $this->db->beginTransaction();

            // Get current status
            $stmt = $this->db->prepare("SELECT status FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            $order = $stmt->fetch();

            if (!$order) {
                throw new Exception("Order not found");
            }

            $oldStatus = $order['status'];

            // Add state machine transition guard
            $allowedTransitions = [
                'pending'    => ['paid', 'cancelled'],
                'paid'       => ['processing', 'cancelled', 'refunded'],
                'processing' => ['shipped', 'cancelled'],
                'shipped'    => ['delivered'],
                'delivered'  => ['refunded'],
                'cancelled'  => [],
                'refunded'   => []
            ];

            if (!isset($allowedTransitions[$oldStatus]) || !in_array($newStatus, $allowedTransitions[$oldStatus])) {
                throw new Exception("Invalid status transition from '{$oldStatus}' to '{$newStatus}'");
            }

            // Update order status
            $stmt = $this->db->prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$newStatus, $orderId]);

            // Record status change in history if admin ID is provided
            if ($adminId) {
                $stmt = $this->db->prepare(
                    "INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes) 
                     VALUES (?, ?, ?, ?, ?)"
                );
                $stmt->execute([$orderId, $oldStatus, $newStatus, $adminId, $notes]);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getStatusHistory($orderId) {
        $stmt = $this->db->prepare(
            "SELECT osh.*, u.name as admin_name 
             FROM order_status_history osh 
             LEFT JOIN users u ON osh.changed_by = u.id 
             WHERE osh.order_id = ? 
             ORDER BY osh.created_at DESC"
        );
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }

    public function getAllOrders($page = 1, $limit = 20, $status = null) {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT o.*, u.name as customer_name, u.email as customer_email
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id";
        
        $params = [];
        
        if ($status) {
            $sql .= " WHERE o.status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();
        
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'], true) ?? [];
        }
        
        return $orders;
    }

    public function getOrderCount($status = null) {
        $sql = "SELECT COUNT(*) as count FROM orders";
        $params = [];
        
        if ($status) {
            $sql .= " WHERE status = ?";
            $params[] = $status;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return $result['count'];
    }
}
