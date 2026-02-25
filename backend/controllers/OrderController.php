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

        // Validate and calculate total with price verification
        $totalAmount = 0;
        $validatedItems = [];

        try {
            $this->orderModel->db->beginTransaction();

            foreach ($data['items'] as $item) {
                if (!isset($item['product_id']) || !isset($item['quantity'])) {
                    $this->orderModel->db->rollBack();
                    Response::error('Invalid item data', 400);
                }

                // Fetch current product data to prevent price tampering
                $stmt = $this->orderModel->db->prepare(
                    "SELECT id, name, price, stock, is_active FROM products WHERE id = ?"
                );
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch();

                if (!$product) {
                    $this->orderModel->db->rollBack();
                    Response::error("Product not found: {$item['product_id']}", 404);
                }

                if (!$product['is_active']) {
                    $this->orderModel->db->rollBack();
                    Response::error("{$product['name']} is no longer available", 400);
                }

                if ($product['stock'] < $item['quantity']) {
                    $this->orderModel->db->rollBack();
                    Response::error("Insufficient stock for {$product['name']}", 400);
                }

                // Use server-side price, not client-provided price
                $validatedItems[] = [
                    'product_id' => $product['id'],
                    'quantity' => $item['quantity'],
                    'price' => $product['price']
                ];

                $totalAmount += $product['price'] * $item['quantity'];
            }

            $orderId = $this->orderModel->create(
                $user['user_id'],
                $totalAmount,
                Validator::sanitizeString($data['shipping_address']),
                $validatedItems,
                $paymentMethod
            );

            // Clear user's cart after successful order
            $stmt = $this->orderModel->db->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user['user_id']]);

            $this->orderModel->db->commit();

            $order = $this->orderModel->getById($orderId);
            Response::success($order, 'Order created successfully', 201);
        } catch (Exception $e) {
            if ($this->orderModel->db->inTransaction()) {
                $this->orderModel->db->rollBack();
            }
            error_log('Order creation error: ' . $e->getMessage());
            Response::error('Failed to create order', 500);
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
}
