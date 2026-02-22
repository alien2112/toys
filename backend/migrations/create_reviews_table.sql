-- Create reviews table with security constraints
-- Migration: 2024-02-21_create_reviews_table.sql

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `rating` tinyint(1) NOT NULL COMMENT '1-5 star rating',
  `review_text` text DEFAULT NULL COMMENT 'Sanitized review content',
  `is_verified_purchase` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Verified buyer flag',
  `helpful_votes` int(11) NOT NULL DEFAULT 0 COMMENT 'Helpful vote count',
  `status` enum('pending','approved','rejected','flagged') NOT NULL DEFAULT 'approved' COMMENT 'Review moderation status',
  `admin_notes` text DEFAULT NULL COMMENT 'Admin moderation notes',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'User IP for fraud detection',
  `user_agent` text DEFAULT NULL COMMENT 'Browser fingerprint for security',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_review` (`user_id`, `product_id`) COMMENT 'Prevent duplicate reviews',
  KEY `idx_product_id` (`product_id`) COMMENT 'Fast product lookup',
  KEY `idx_user_id` (`user_id`) COMMENT 'Fast user lookup',
  KEY `idx_order_id` (`order_id`) COMMENT 'Order verification',
  KEY `idx_rating` (`rating`) COMMENT 'Rating filters',
  KEY `idx_status` (`status`) COMMENT 'Moderation filters',
  KEY `idx_created_at` (`created_at`) COMMENT 'Time-based sorting',
  KEY `idx_verified_purchase` (`is_verified_purchase`) COMMENT 'Verified buyer filter',
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_rating_range` CHECK (`rating` >= 1 AND `rating` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product reviews with fraud protection';

-- Create review_helpful_votes table for tracking helpful votes
CREATE TABLE IF NOT EXISTS `review_helpful_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `vote_type` enum('helpful','not_helpful') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review_user_vote` (`review_id`, `user_id`) COMMENT 'One vote per user per review',
  KEY `idx_review_id` (`review_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_helpful_votes_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_helpful_votes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track helpful votes on reviews';

-- Create review_audit_log table for security tracking
CREATE TABLE IF NOT EXISTS `review_audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) DEFAULT NULL,
  `action` enum('created','updated','deleted','flagged','approved','rejected') NOT NULL,
  `user_id` int(11) DEFAULT NULL COMMENT 'Who performed action',
  `old_data` json DEFAULT NULL COMMENT 'Previous state',
  `new_data` json DEFAULT NULL COMMENT 'New state',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_review_id` (`review_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_audit_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for review changes';
