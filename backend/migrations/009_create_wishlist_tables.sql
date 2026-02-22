-- Create wishlist related tables
-- Migration: 2024-02-22_create_wishlist_tables.sql

CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Owner of the wishlist',
  `name` varchar(255) NOT NULL DEFAULT 'My Wishlist' COMMENT 'Wishlist name',
  `slug` varchar(255) DEFAULT NULL COMMENT 'URL-friendly slug for sharing',
  `is_public` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether wishlist is publicly shareable',
  `share_token` varchar(64) DEFAULT NULL COMMENT 'Unique token for sharing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_share_token` (`share_token`) COMMENT 'Prevent duplicate share tokens',
  KEY `idx_user_id` (`user_id`) COMMENT 'Fast user lookup',
  KEY `idx_slug` (`slug`) COMMENT 'Slug lookup for public sharing',
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User wishlists with sharing support';

CREATE TABLE IF NOT EXISTS `wishlist_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wishlist_id` int(11) NOT NULL COMMENT 'Reference to wishlists table',
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `added_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When item was added',
  `stock_alert` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether to notify when back in stock',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist_product` (`wishlist_id`, `product_id`) COMMENT 'Prevent duplicates',
  KEY `idx_wishlist_id` (`wishlist_id`) COMMENT 'Fast wishlist lookup',
  KEY `idx_product_id` (`product_id`) COMMENT 'Product lookup',
  KEY `idx_stock_alert` (`stock_alert`) COMMENT 'Stock alert filtering',
  CONSTRAINT `fk_wishlist_items_wishlist` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlist_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items in user wishlists with stock alerts';

-- Create default wishlist for existing users
INSERT IGNORE INTO wishlists (user_id, name, slug, is_public, share_token)
SELECT 
  id as user_id,
  'My Wishlist' as name,
  CONCAT('wishlist-', id, '-', UNIX_TIMESTAMP()) as slug,
  0 as is_public,
  SHA2(CONCAT(id, UNIX_TIMESTAMP(), RAND()), 256) as share_token
FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM wishlists);
