<?php

require_once __DIR__ . '/../models/Wishlist.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class WishlistController {
    private $wishlistModel;

    public function __construct() {
        $this->wishlistModel = new Wishlist();
    }

    /**
     * Get user's default wishlist with items
     */
    public function getDefaultWishlist() {
        $user = AuthMiddleware::authenticate();
        
        $wishlist = $this->wishlistModel->getDefaultWishlist($user['user_id']);
        $items = $this->wishlistModel->getWishlistItems($wishlist['id']);
        
        Response::success([
            'wishlist' => $wishlist,
            'items' => $items
        ]);
    }

    /**
     * Get all user wishlists
     */
    public function getUserWishlists() {
        $user = AuthMiddleware::authenticate();
        
        $wishlists = $this->wishlistModel->getUserWishlists($user['user_id']);
        
        // Add item count to each wishlist
        foreach ($wishlists as &$wishlist) {
            $items = $this->wishlistModel->getWishlistItems($wishlist['id']);
            $wishlist['item_count'] = count($items);
        }
        
        Response::success($wishlists);
    }

    /**
     * Add item to wishlist
     */
    public function addItem() {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['product_id'])) {
            Response::error('Product ID is required', 400);
        }

        if (!Validator::integer($data['product_id'])) {
            Response::error('Invalid product ID', 400);
        }

        $wishlist = $this->wishlistModel->getDefaultWishlist($user['user_id']);
        $stockAlert = $data['stock_alert'] ?? false;
        
        if ($this->wishlistModel->addItem($wishlist['id'], $data['product_id'], $stockAlert)) {
            Response::success(null, 'Item added to wishlist', 201);
        } else {
            Response::error('Item already in wishlist', 409);
        }
    }

    /**
     * Remove item from wishlist
     */
    public function removeItem($productId) {
        $user = AuthMiddleware::authenticate();
        
        if (!Validator::integer($productId)) {
            Response::error('Invalid product ID', 400);
        }

        $wishlist = $this->wishlistModel->getDefaultWishlist($user['user_id']);
        
        if ($this->wishlistModel->removeItem($wishlist['id'], $productId)) {
            Response::success(null, 'Item removed from wishlist');
        } else {
            Response::error('Item not found in wishlist', 404);
        }
    }

    /**
     * Toggle stock alert for wishlist item
     */
    public function toggleStockAlert($productId) {
        $user = AuthMiddleware::authenticate();
        
        if (!Validator::integer($productId)) {
            Response::error('Invalid product ID', 400);
        }

        $wishlist = $this->wishlistModel->getDefaultWishlist($user['user_id']);
        
        if ($this->wishlistModel->toggleStockAlert($wishlist['id'], $productId)) {
            Response::success(null, 'Stock alert toggled');
        } else {
            Response::error('Item not found in wishlist', 404);
        }
    }

    /**
     * Get public wishlist by share token
     */
    public function getPublicWishlist($shareToken) {
        $wishlist = $this->wishlistModel->getByShareToken($shareToken);
        
        if (!$wishlist) {
            Response::error('Wishlist not found or not public', 404);
        }

        $items = $this->wishlistModel->getWishlistItems($wishlist['id']);
        
        Response::success([
            'wishlist' => $wishlist,
            'items' => $items
        ]);
    }

    /**
     * Update wishlist sharing settings
     */
    public function updateSharing() {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        $wishlist = $this->wishlistModel->getDefaultWishlist($user['user_id']);
        
        $isPublic = $data['is_public'] ?? false;
        $name = $data['name'] ?? null;
        
        if ($this->wishlistModel->updateSharing($wishlist['id'], $isPublic, $name)) {
            // Get updated wishlist
            $updated = $this->wishlistModel->getDefaultWishlist($user['user_id']);
            Response::success($updated);
        } else {
            Response::error('Failed to update sharing settings', 500);
        }
    }

    /**
     * Create new wishlist
     */
    public function createWishlist() {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name'])) {
            Response::error('Wishlist name is required', 400);
        }

        $wishlistId = $this->wishlistModel->create(
            $user['user_id'], 
            $data['name'], 
            $data['is_public'] ?? false
        );
        
        if ($wishlistId) {
            Response::success(['id' => $wishlistId], 'Wishlist created', 201);
        } else {
            Response::error('Failed to create wishlist', 500);
        }
    }

    /**
     * Delete wishlist
     */
    public function deleteWishlist($wishlistId) {
        $user = AuthMiddleware::authenticate();
        
        if (!Validator::integer($wishlistId)) {
            Response::error('Invalid wishlist ID', 400);
        }

        if ($this->wishlistModel->delete($wishlistId, $user['user_id'])) {
            Response::success(null, 'Wishlist deleted');
        } else {
            Response::error('Wishlist not found or cannot be deleted', 404);
        }
    }

    /**
     * Get stock alert items (for notifications)
     */
    public function getStockAlertItems() {
        AuthMiddleware::requireAdmin();
        
        $items = $this->wishlistModel->getStockAlertItems();
        Response::success($items);
    }
}
