<?php

require_once __DIR__ . '/../models/Inventory.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class InventoryController {
    private $inventoryModel;

    public function __construct() {
        $this->inventoryModel = new Inventory();
    }

    /**
     * Get low stock alerts
     */
    public function getLowStockAlerts() {
        AuthMiddleware::requireAdmin();
        
        $threshold = $_GET['threshold'] ?? 10;
        $alerts = $this->inventoryModel->getLowStockAlerts($threshold);
        
        Response::success($alerts);
    }

    /**
     * Set low stock alert threshold
     */
    public function setLowStockAlert() {
        AuthMiddleware::requireAdmin();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['product_id']) || !isset($data['threshold'])) {
            Response::error('Product ID and threshold are required', 400);
        }
        
        if (!Validator::integer($data['product_id']) || !Validator::integer($data['threshold'])) {
            Response::error('Invalid product ID or threshold', 400);
        }
        
        if ($this->inventoryModel->setLowStockAlert($data['product_id'], $data['threshold'])) {
            Response::success(null, 'Low stock alert set successfully');
        } else {
            Response::error('Failed to set low stock alert', 500);
        }
    }

    /**
     * Get inventory movements for a product
     */
    public function getInventoryMovements($productId) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($productId)) {
            Response::error('Invalid product ID', 400);
        }
        
        $limit = $_GET['limit'] ?? 50;
        $movements = $this->inventoryModel->getMovements($productId, $limit);
        
        Response::success($movements);
    }

    /**
     * Create stock reservation
     */
    public function createReservation() {
        $user = AuthMiddleware::authenticate();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['product_id']) || !isset($data['quantity'])) {
            Response::error('Product ID and quantity are required', 400);
        }
        
        if (!Validator::integer($data['product_id']) || !Validator::integer($data['quantity'])) {
            Response::error('Invalid product ID or quantity', 400);
        }
        
        // Check available stock
        $availableStock = $this->inventoryModel->getAvailableStock($data['product_id']);
        if ($availableStock < $data['quantity']) {
            Response::error('Insufficient stock available', 400);
        }
        
        $expiresIn = $data['expires_in_minutes'] ?? 30;
        
        if ($this->inventoryModel->createReservation($data['product_id'], $user['user_id'], $data['quantity'], $expiresIn)) {
            Response::success(null, 'Stock reservation created', 201);
        } else {
            Response::error('Failed to create reservation', 500);
        }
    }

    /**
     * Get user's reservations
     */
    public function getUserReservations() {
        $user = AuthMiddleware::authenticate();
        
        $reservations = $this->inventoryModel->getUserReservations($user['user_id']);
        Response::success($reservations);
    }

    /**
     * Batch update inventory
     */
    public function batchUpdate() {
        AuthMiddleware::requireAdmin();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['updates']) || !is_array($data['updates'])) {
            Response::error('Updates array is required', 400);
        }
        
        foreach ($data['updates'] as $update) {
            if (!isset($update['product_id']) || !isset($update['stock'])) {
                Response::error('Each update must contain product_id and stock', 400);
            }
            
            if (!Validator::integer($update['product_id']) || !Validator::integer($update['stock'])) {
                Response::error('Invalid product ID or stock in updates', 400);
            }
            
            if ($update['stock'] < 0) {
                Response::error('Stock cannot be negative', 400);
            }
        }
        
        try {
            $this->inventoryModel->batchUpdate($data['updates']);
            Response::success(null, 'Inventory updated successfully');
        } catch (Exception $e) {
            Response::error('Failed to update inventory: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Expire old reservations (cleanup job)
     */
    public function expireReservations() {
        AuthMiddleware::requireAdmin();

        $this->inventoryModel->expireReservations();
        Response::success(null, 'Expired reservations cleaned up');
    }

    /**
     * Get available stock for product
     */
    public function getAvailableStock($productId) {
        if (!Validator::integer($productId)) {
            Response::error('Invalid product ID', 400);
        }
        
        $available = $this->inventoryModel->getAvailableStock($productId);
        Response::success(['available_stock' => $available]);
    }
}
