<?php

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CartController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getCart($userId) {
        $user = AuthMiddleware::authenticate();

        if ($user['user_id'] != $userId) {
            Response::error('Unauthorized', 403);
        }

        $stmt = $this->db->prepare(
            "SELECT c.*, p.name, p.price, p.image_url, p.stock 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?"
        );
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();

        Response::success(['items' => $items]);
    }

    public function addToCart() {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['product_id']) || !isset($data['quantity'])) {
            Response::error('Missing required fields', 400);
        }

        if (!Validator::integer($data['product_id']) || !Validator::quantity($data['quantity'])) {
            Response::error('Invalid product ID or quantity', 400);
        }

        try {
            $this->db->beginTransaction();

            // Lock product row for update
            $stmt = $this->db->prepare("SELECT stock, is_active FROM products WHERE id = ? FOR UPDATE");
            $stmt->execute([$data['product_id']]);
            $product = $stmt->fetch();

            if (!$product) {
                $this->db->rollBack();
                Response::error('Product not found', 404);
            }

            if (!$product['is_active']) {
                $this->db->rollBack();
                Response::error('Product is not available', 400);
            }

            if ($product['stock'] < $data['quantity']) {
                $this->db->rollBack();
                Response::error('Insufficient stock', 400);
            }

            // Check if product is already in cart
            $stmt = $this->db->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$user['user_id'], $data['product_id']]);
            $existingCartItem = $stmt->fetch();

            if ($existingCartItem && ($existingCartItem['quantity'] + $data['quantity']) > $product['stock']) {
                $this->db->rollBack();
                Response::error('Insufficient stock for requested quantity', 400);
            }

            $stmt = $this->db->prepare(
                "INSERT INTO cart (user_id, product_id, quantity) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE quantity = quantity + ?"
            );
            $stmt->execute([
                $user['user_id'],
                $data['product_id'],
                $data['quantity'],
                $data['quantity']
            ]);

            $this->db->commit();
            Response::success(null, 'Item added to cart', 201);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            Response::error('Failed to add item to cart', 500);
        }
    }

    public function updateCartItem($cartItemId) {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['quantity'])) {
            Response::error('Quantity is required', 400);
        }

        if (!Validator::quantity($data['quantity'])) {
            Response::error('Invalid quantity', 400);
        }

        try {
            $this->db->beginTransaction();

            // Verify cart item belongs to user
            $stmt = $this->db->prepare("SELECT product_id FROM cart WHERE id = ? AND user_id = ?");
            $stmt->execute([$cartItemId, $user['user_id']]);
            $cartItem = $stmt->fetch();

            if (!$cartItem) {
                $this->db->rollBack();
                Response::error('Cart item not found', 404);
            }

            // Lock product row for stock check
            $stmt = $this->db->prepare("SELECT stock FROM products WHERE id = ? FOR UPDATE");
            $stmt->execute([$cartItem['product_id']]);
            $product = $stmt->fetch();

            if ($product['stock'] < $data['quantity']) {
                $this->db->rollBack();
                Response::error('Insufficient stock', 400);
            }

            // Update quantity
            $stmt = $this->db->prepare("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$data['quantity'], $cartItemId, $user['user_id']]);

            $this->db->commit();
            Response::success(null, 'Cart updated successfully');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            Response::error('Failed to update cart', 500);
        }
    }

    public function removeCartItem($cartItemId) {
        $user = AuthMiddleware::authenticate();

        try {
            $stmt = $this->db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
            $stmt->execute([$cartItemId, $user['user_id']]);

            if ($stmt->rowCount() === 0) {
                Response::error('Cart item not found', 404);
            }

            Response::success(null, 'Item removed from cart');
        } catch (Exception $e) {
            Response::error('Failed to remove item', 500);
        }
    }

    public function clearCart() {
        $user = AuthMiddleware::authenticate();

        try {
            $stmt = $this->db->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user['user_id']]);

            Response::success(null, 'Cart cleared successfully');
        } catch (Exception $e) {
            Response::error('Failed to clear cart', 500);
        }
    }

    public function validateCart() {
        $user = AuthMiddleware::authenticate();

        try {
            $stmt = $this->db->prepare(
                "SELECT c.*, p.name, p.price, p.stock, p.is_active 
                 FROM cart c 
                 JOIN products p ON c.product_id = p.id 
                 WHERE c.user_id = ?"
            );
            $stmt->execute([$user['user_id']]);
            $items = $stmt->fetchAll();

            $errors = [];
            $valid = true;

            foreach ($items as $item) {
                if (!$item['is_active']) {
                    $errors[] = "{$item['name']} is no longer available";
                    $valid = false;
                } elseif ($item['stock'] < $item['quantity']) {
                    $errors[] = "{$item['name']} has insufficient stock (available: {$item['stock']})";
                    $valid = false;
                }
            }

            Response::success([
                'valid' => $valid,
                'errors' => $errors,
                'items' => $items
            ]);
        } catch (Exception $e) {
            Response::error('Failed to validate cart', 500);
        }
    }
}
