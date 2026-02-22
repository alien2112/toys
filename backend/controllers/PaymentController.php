<?php

require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class PaymentController {
    private $paymentModel;
    private $orderModel;

    public function __construct() {
        $this->paymentModel = new Payment();
        $this->orderModel = new Order();
    }

    /**
     * Create payment intent for specified gateway
     */
    public function createPaymentIntent() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        RateLimiter::check('payment_create_' . $ip, 20, 60); // 20 payment attempts per hour per IP
        
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['order_id']) || !isset($data['gateway'])) {
            Response::error('Missing required fields: order_id, gateway', 400);
        }

        $allowedGateways = ['moyasar', 'stripe', 'cod'];
        if (!in_array($data['gateway'], $allowedGateways)) {
            Response::error('Invalid payment gateway', 400);
        }

        try {
            // Verify order belongs to user
            $order = $this->orderModel->getById($data['order_id']);
            if (!$order || $order['user_id'] != $user['user_id']) {
                Response::error('Order not found', 404);
            }

            if ($order['status'] !== 'pending') {
                Response::error('Order cannot be paid for', 400);
            }

            // Check if payment already exists for this order
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT id, status FROM payments WHERE order_id = ? AND status IN ('pending', 'completed') LIMIT 1");
            $stmt->execute([$data['order_id']]);
            $existingPayment = $stmt->fetch();
            
            if ($existingPayment) {
                Response::error('A payment already exists for this order', 409);
            }

            // Create payment record
            $paymentId = $this->paymentModel->create([
                'order_id' => $data['order_id'],
                'amount' => $order['total_amount'],
                'currency' => 'KWD',
                'gateway' => $data['gateway'],
                'status' => 'pending'
            ]);

            $payment = $this->paymentModel->getById($paymentId);

            // Handle different gateways
            switch ($data['gateway']) {
                case 'moyasar':
                    $result = $this->createMoyasarPayment($payment, $order);
                    break;
                case 'stripe':
                    $result = $this->createStripePayment($payment, $order);
                    break;
                case 'cod':
                    $result = $this->createCashOnDeliveryPayment($payment, $order);
                    break;
                default:
                    Response::error('Unsupported payment gateway', 400);
            }

            Response::success($result, 'Payment intent created successfully');
        } catch (Exception $e) {
            error_log('Payment creation error: ' . $e->getMessage());
            Response::error('Failed to create payment', 500);
        }
    }

    /**
     * Create Moyasar payment
     */
    private function createMoyasarPayment($payment, $order) {
        $apiKey = $_ENV['MOYASAR_API_KEY'] ?? '';
        if (empty($apiKey)) {
            Response::error('Moyasar API key not configured', 500);
        }

        $callbackUrl = $_ENV['APP_URL'] . '/api/payments/moyasar/callback';
        
        $payload = [
            'amount' => (int)($payment['amount'] * 100), // Convert to halala
            'currency' => $payment['currency'],
            'description' => "Order #{$order['id']}",
            'callback_url' => $callbackUrl,
            'metadata' => [
                'payment_id' => $payment['id'],
                'order_id' => $order['id']
            ]
        ];

        $ch = curl_init('https://api.moyasar.com/v1/payments');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($apiKey . ':')
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201) {
            error_log('Moyasar API error: ' . $response);
            Response::error('Failed to create Moyasar payment', 500);
        }

        $moyasarResponse = json_decode($response, true);

        // Update payment with gateway reference
        $this->paymentModel->update($payment['id'], [
            'gateway_ref' => $moyasarResponse['id'],
            'raw_response' => json_encode($moyasarResponse)
        ]);

        return [
            'payment_id' => $payment['id'],
            'gateway' => 'moyasar',
            'payment_url' => $moyasarResponse['transaction_url'] ?? null,
            'gateway_ref' => $moyasarResponse['id']
        ];
    }

    /**
     * Create Stripe payment intent
     */
    private function createStripePayment($payment, $order) {
        $secretKey = $_ENV['STRIPE_SECRET_KEY'] ?? '';
        if (empty($secretKey)) {
            Response::error('Stripe secret key not configured', 500);
        }

        $successUrl = $_ENV['APP_URL'] . '/payment/success?session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = $_ENV['APP_URL'] . '/payment/cancel';

        $payload = [
            'payment_method_types' => ['card'],
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => strtolower($payment['currency']),
                        'product_data' => [
                            'name' => "Order #{$order['id']}",
                            'description' => "Payment for order #{$order['id']}"
                        ],
                        'unit_amount' => (int)($payment['amount'] * 100)
                    ],
                    'quantity' => 1
                ]
            ],
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'payment_id' => $payment['id'],
                'order_id' => $order['id']
            ]
        ];

        $ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Bearer ' . $secretKey
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            error_log('Stripe API error: ' . $response);
            Response::error('Failed to create Stripe payment', 500);
        }

        $stripeResponse = json_decode($response, true);

        // Update payment with gateway reference
        $this->paymentModel->update($payment['id'], [
            'gateway_ref' => $stripeResponse['id'],
            'raw_response' => json_encode($stripeResponse)
        ]);

        return [
            'payment_id' => $payment['id'],
            'gateway' => 'stripe',
            'checkout_url' => $stripeResponse['url'],
            'gateway_ref' => $stripeResponse['id']
        ];
    }

    /**
     * Create Cash on Delivery payment
     */
    private function createCashOnDeliveryPayment($payment, $order) {
        // Mark as completed immediately for COD
        $this->paymentModel->update($payment['id'], [
            'status' => 'completed',
            'gateway_ref' => 'COD-' . time()
        ]);

        // Update order status
        $this->orderModel->updateStatus($order['id'], 'paid');

        return [
            'payment_id' => $payment['id'],
            'gateway' => 'cod',
            'status' => 'completed',
            'message' => 'Cash on delivery payment confirmed'
        ];
    }

    /**
     * Handle Moyasar webhook callback
     */
    public function moyasarCallback() {
        $input = file_get_contents('php://input');
        $event = json_decode($input, true);

        if (!$event || !isset($event['id'])) {
            Response::error('Invalid callback data', 400);
        }

        // Verify webhook signature if needed
        $signature = $_SERVER['HTTP_X_MOYASAR_SIGNATURE'] ?? '';
        if (!$this->verifyMoyasarSignature($input, $signature)) {
            Response::error('Invalid signature', 401);
        }

        try {
            $paymentId = $event['metadata']['payment_id'] ?? null;
            $orderId = $event['metadata']['order_id'] ?? null;

            if (!$paymentId) {
                Response::error('Payment ID not found in callback', 400);
            }

            $payment = $this->paymentModel->getById($paymentId);
            if (!$payment) {
                Response::error('Payment not found', 404);
            }

            // Update payment status based on Moyasar status
            $status = $this->mapMoyasarStatus($event['status']);
            $this->paymentModel->update($paymentId, [
                'status' => $status,
                'raw_response' => json_encode($event)
            ]);

            // Update order status if payment is completed
            if ($status === 'completed' && $orderId) {
                $this->orderModel->updateStatus($orderId, 'paid');
            }

            Response::success(['status' => 'processed'], 'Callback processed successfully');
        } catch (Exception $e) {
            error_log('Moyasar callback error: ' . $e->getMessage());
            Response::error('Failed to process callback', 500);
        }
    }

    /**
     * Handle Stripe webhook
     */
    public function stripeWebhook() {
        $input = file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        $endpointSecret = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '';

        if (!$this->verifyStripeSignature($input, $sigHeader, $endpointSecret)) {
            Response::error('Invalid signature', 401);
        }

        $event = json_decode($input, true);

        try {
            if ($event['type'] === 'checkout.session.completed') {
                $session = $event['data']['object'];
                $paymentId = $session['metadata']['payment_id'] ?? null;
                $orderId = $session['metadata']['order_id'] ?? null;

                if ($paymentId) {
                    $this->paymentModel->update($paymentId, [
                        'status' => 'completed',
                        'raw_response' => json_encode($event)
                    ]);

                    if ($orderId) {
                        $this->orderModel->updateStatus($orderId, 'paid');
                    }
                }
            }

            Response::success(['status' => 'processed'], 'Webhook processed successfully');
        } catch (Exception $e) {
            error_log('Stripe webhook error: ' . $e->getMessage());
            Response::error('Failed to process webhook', 500);
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus($paymentId) {
        $user = AuthMiddleware::authenticate();
        
        $payment = $this->paymentModel->getById($paymentId);
        if (!$payment) {
            Response::error('Payment not found', 404);
        }

        // Verify user owns this payment
        $order = $this->orderModel->getById($payment['order_id']);
        if (!$order || $order['user_id'] != $user['user_id']) {
            Response::error('Unauthorized', 403);
        }

        Response::success($payment);
    }

    /**
     * Map Moyasar status to our status
     */
    private function mapMoyasarStatus($moyasarStatus) {
        $statusMap = [
            'initiated' => 'pending',
            'pending' => 'pending',
            'paid' => 'completed',
            'failed' => 'failed',
            'refunded' => 'refunded'
        ];

        return $statusMap[$moyasarStatus] ?? 'pending';
    }

    /**
     * Verify Moyasar signature
     */
    private function verifyMoyasarSignature($payload, $signature) {
        $secret = $_ENV['MOYASAR_WEBHOOK_SECRET'] ?? '';
        if (empty($secret)) {
            return true; // Skip verification if not configured
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Verify Stripe signature
     */
    private function verifyStripeSignature($payload, $signature, $secret) {
        if (empty($secret)) {
            return true; // Skip verification if not configured
        }

        $event = null;
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $signature, $secret
            );
        } catch(\UnexpectedValueException $e) {
            return false;
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            return false;
        }

        return true;
    }
}
