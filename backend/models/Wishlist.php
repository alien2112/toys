<?php

class Wishlist {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get or create default wishlist for user
     */
    public function getDefaultWishlist($userId) {
        $stmt = $this->db->prepare("SELECT * FROM wishlists WHERE user_id = ? ORDER BY id ASC LIMIT 1");
        $stmt->execute([$userId]);
        $wishlist = $stmt->fetch();

        if (!$wishlist) {
            // Create default wishlist
            $stmt = $this->db->prepare(
                "INSERT INTO wishlists (user_id, name, slug, is_public, share_token) 
                 VALUES (?, 'My Wishlist', CONCAT('wishlist-', ?, '-', UNIX_TIMESTAMP()), 0, SHA2(CONCAT(?, UNIX_TIMESTAMP(), RAND()), 256))"
            );
            $stmt->execute([$userId, $userId, $userId]);
            
            $wishlistId = $this->db->lastInsertId();
            $stmt = $this->db->prepare("SELECT * FROM wishlists WHERE id = ?");
            $stmt->execute([$wishlistId]);
            $wishlist = $stmt->fetch();
        }

        return $wishlist;
    }

    /**
     * Get all wishlists for a user
     */
    public function getUserWishlists($userId) {
        $stmt = $this->db->prepare("SELECT * FROM wishlists WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Get wishlist items with product details
     */
    public function getWishlistItems($wishlistId) {
        $stmt = $this->db->prepare(
            "SELECT wi.*, p.name, p.price, p.image_url, p.stock, p.is_active, p.slug as product_slug
             FROM wishlist_items wi
             JOIN products p ON wi.product_id = p.id
             WHERE wi.wishlist_id = ?
             ORDER BY wi.added_at DESC"
        );
        $stmt->execute([$wishlistId]);
        return $stmt->fetchAll();
    }

    /**
     * Add item to wishlist
     */
    public function addItem($wishlistId, $productId, $stockAlert = false) {
        $stmt = $this->db->prepare(
            "INSERT IGNORE INTO wishlist_items (wishlist_id, product_id, stock_alert) 
             VALUES (?, ?, ?)"
        );
        return $stmt->execute([$wishlistId, $productId, $stockAlert ? 1 : 0]);
    }

    /**
     * Remove item from wishlist
     */
    public function removeItem($wishlistId, $productId) {
        $stmt = $this->db->prepare(
            "DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?"
        );
        return $stmt->execute([$wishlistId, $productId]);
    }

    /**
     * Toggle stock alert for item
     */
    public function toggleStockAlert($wishlistId, $productId) {
        $stmt = $this->db->prepare(
            "UPDATE wishlist_items 
             SET stock_alert = NOT stock_alert 
             WHERE wishlist_id = ? AND product_id = ?"
        );
        return $stmt->execute([$wishlistId, $productId]);
    }

    /**
     * Get wishlist by share token
     */
    public function getByShareToken($shareToken) {
        $stmt = $this->db->prepare(
            "SELECT w.*, u.first_name, u.last_name 
             FROM wishlists w
             JOIN users u ON w.user_id = u.id
             WHERE w.share_token = ? AND w.is_public = 1"
        );
        $stmt->execute([$shareToken]);
        return $stmt->fetch();
    }

    /**
     * Update wishlist sharing settings
     */
    public function updateSharing($wishlistId, $isPublic, $name = null) {
        $sql = "UPDATE wishlists SET is_public = ?";
        $params = [$isPublic ? 1 : 0];
        
        if ($name) {
            $sql .= ", name = ?";
            $params[] = $name;
        }
        
        if ($isPublic && !$this->hasShareToken($wishlistId)) {
            $sql .= ", share_token = SHA2(CONCAT(id, UNIX_TIMESTAMP(), RAND()), 256)";
        }
        
        $sql .= " WHERE id = ?";
        $params[] = $wishlistId;
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Check if wishlist has share token
     */
    private function hasShareToken($wishlistId) {
        $stmt = $this->db->prepare("SELECT share_token FROM wishlists WHERE id = ? AND share_token IS NOT NULL");
        $stmt->execute([$wishlistId]);
        return $stmt->fetch() !== false;
    }

    /**
     * Get items with stock alerts for products that are back in stock
     */
    public function getStockAlertItems() {
        $stmt = $this->db->prepare(
            "SELECT wi.*, w.user_id, p.name as product_name, p.price
             FROM wishlist_items wi
             JOIN wishlists w ON wi.wishlist_id = w.id
             JOIN products p ON wi.product_id = p.id
             WHERE wi.stock_alert = 1 
             AND p.is_active = 1 
             AND p.stock > 0
             AND wi.id NOT IN (
                 SELECT item_id FROM stock_notifications WHERE item_id = wi.id
             )"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Create wishlist
     */
    public function create($userId, $name, $isPublic = false) {
        $stmt = $this->db->prepare(
            "INSERT INTO wishlists (user_id, name, slug, is_public, share_token) 
             VALUES (?, ?, CONCAT('wishlist-', ?, '-', UNIX_TIMESTAMP()), ?, SHA2(CONCAT(?, UNIX_TIMESTAMP(), RAND()), 256))"
        );
        $stmt->execute([$userId, $name, $userId, $isPublic ? 1 : 0, $userId]);
        return $this->db->lastInsertId();
    }

    /**
     * Delete wishlist
     */
    public function delete($wishlistId, $userId) {
        $stmt = $this->db->prepare("DELETE FROM wishlists WHERE id = ? AND user_id = ?");
        return $stmt->execute([$wishlistId, $userId]);
    }
}
