-- Create payments table for payment processing
-- Migration: 2024-02-22_create_payments_table.sql

CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL COMMENT 'Reference to orders table',
  `amount` decimal(10,2) NOT NULL COMMENT 'Payment amount',
  `currency` varchar(10) NOT NULL DEFAULT 'KWD' COMMENT 'Currency code',
  `gateway` enum('moyasar','stripe','cod') NOT NULL COMMENT 'Payment gateway used',
  `gateway_ref` varchar(255) DEFAULT NULL COMMENT 'Gateway transaction reference',
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT 'Payment status',
  `raw_response` text DEFAULT NULL COMMENT 'Raw response from payment gateway',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_gateway_ref` (`gateway_ref`) COMMENT 'Prevent duplicate payment records',
  KEY `idx_order_id` (`order_id`) COMMENT 'Fast order lookup',
  KEY `idx_status` (`status`) COMMENT 'Status filtering',
  KEY `idx_gateway` (`gateway`) COMMENT 'Gateway filtering',
  KEY `idx_created_at` (`created_at`) COMMENT 'Date-based sorting',
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payment transactions with gateway integration';
