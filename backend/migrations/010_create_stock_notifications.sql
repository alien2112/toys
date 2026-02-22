-- Create stock notifications table for tracking sent alerts
-- Migration: 2024-02-22_create_stock_notifications.sql

CREATE TABLE IF NOT EXISTS `stock_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL COMMENT 'Reference to wishlist_items table',
  `user_id` int(11) NOT NULL COMMENT 'Reference to users table',
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `notification_type` enum('email', 'push', 'sms') NOT NULL DEFAULT 'email' COMMENT 'Type of notification sent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When notification was sent',
  `status` enum('sent', 'delivered', 'failed') NOT NULL DEFAULT 'sent' COMMENT 'Delivery status',
  PRIMARY KEY (`id`),
  KEY `idx_item_id` (`item_id`) COMMENT 'Fast item lookup',
  KEY `idx_user_id` (`user_id`) COMMENT 'User lookup',
  KEY `idx_product_id` (`product_id`) COMMENT 'Product lookup',
  KEY `idx_sent_at` (`sent_at`) COMMENT 'Date filtering',
  CONSTRAINT `fk_stock_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_notifications_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track stock alert notifications sent to users';
