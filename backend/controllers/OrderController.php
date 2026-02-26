<?php

require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class OrderController {
    private $orderModel;

    public function __construct() {
        $this->orderModel = new Order();
    }

    public function create() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        RateLimiter::check('order_create_' . $ip, 10, 60); // 10 orders per hour per IP
        
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['items']) || !isset($data['shipping_address'])) {
            Response::error('Missing required fields', 400);
        }

        if (empty($data['items'])) {
            Response::error('Cart is empty', 400);
        }

        if (!Validator::required($data['shipping_address'])) {
            Response::error('Shipping address is required', 400);
        }

        // Get payment method (default to cash_on_delivery)
        $paymentMethod = $data['payment_method'] ?? 'cash_on_delivery';
        $validPaymentMethods = ['cash_on_delivery', 'credit_card', 'paypal', 'bank_transfer'];
        
        if (!in_array($paymentMethod, $validPaymentMethods)) {
            Response::error('Invalid payment method', 400);
        }

        // Validate item structure before passing to model
        $validatedItems = [];

        foreach ($data['items'] as $item) {
            if (!isset($item['product_id']) || !isset($item['quantity'])) {
                Response::error('Invalid item data', 400);
            }
            $validatedItems[] = [
                'product_id' => (int)$item['product_id'],
                'quantity' => (int)$item['quantity']
            ];
        }

        try {
            // Order::create() handles the full transaction atomically:
            // locks products, validates stock, calculates total from DB prices,
            // inserts order + items, and deducts stock
            $orderId = $this->orderModel->create(
                $user['user_id'],
                0, // ignored — model recalculates from DB prices
                Validator::sanitizeString($data['shipping_address']),
                $validatedItems,
                $paymentMethod
            );

            // Clear user's cart after successful order
            $stmt = $this->orderModel->db->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user['user_id']]);

            $order = $this->orderModel->getById($orderId);
            Response::success($order, 'Order created successfully', 201);
        } catch (Exception $e) {
            error_log('Order creation error: ' . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }

    public function getByUserId($userId) {
        $user = AuthMiddleware::authenticate();

        if ($user['user_id'] != $userId && $user['role'] !== 'admin') {
            Response::error('Unauthorized', 403);
        }

        $orders = $this->orderModel->getByUserId($userId);
        Response::success(['orders' => $orders]);
    }

    public function getById($orderId) {
        $user = AuthMiddleware::authenticate();

        try {
            $order = $this->orderModel->getById($orderId);

            if (!$order) {
                Response::error('Order not found', 404);
            }

            // Verify user owns this order or is admin
            if ($order['user_id'] != $user['user_id'] && $user['role'] !== 'admin') {
                Response::error('Unauthorized', 403);
            }

            Response::success($order);
        } catch (Exception $e) {
            error_log('Order fetch error: ' . $e->getMessage());
            Response::error('Failed to fetch order', 500);
        }
    }
}
