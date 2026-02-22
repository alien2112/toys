-- Create inventory management tables
-- Migration: 2024-02-22_create_inventory_tables.sql

CREATE TABLE IF NOT EXISTS `inventory_reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `user_id` int(11) NOT NULL COMMENT 'Reference to users table',
  `quantity` int(11) NOT NULL COMMENT 'Quantity reserved',
  `reserved_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When reservation was made',
  `expires_at` timestamp NOT NULL COMMENT 'When reservation expires',
  `status` enum('active', 'expired', 'converted') NOT NULL DEFAULT 'active' COMMENT 'Reservation status',
  `order_id` int(11) DEFAULT NULL COMMENT 'Reference to orders table if converted to order',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`) COMMENT 'Product lookup',
  KEY `idx_user_id` (`user_id`) COMMENT 'User lookup',
  KEY `idx_expires_at` (`expires_at`) COMMENT 'Expiration cleanup',
  KEY `idx_status` (`status`) COMMENT 'Status filtering',
  CONSTRAINT `fk_inventory_reservations_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inventory_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inventory_reservations_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stock reservations for cart items';

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'Supplier name',
  `contact_person` varchar(255) DEFAULT NULL COMMENT 'Contact person name',
  `email` varchar(255) DEFAULT NULL COMMENT 'Supplier email',
  `phone` varchar(50) DEFAULT NULL COMMENT 'Supplier phone',
  `address` text DEFAULT NULL COMMENT 'Supplier address',
  `lead_time_days` int(11) DEFAULT 7 COMMENT 'Average lead time in days',
  `min_order_quantity` int(11) DEFAULT 1 COMMENT 'Minimum order quantity',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether supplier is active',
  `notes` text DEFAULT NULL COMMENT 'Additional notes',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`) COMMENT 'Name search',
  KEY `idx_active` (`is_active`) COMMENT 'Active filter'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Supplier information';

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL COMMENT 'Reference to suppliers table',
  `order_number` varchar(50) NOT NULL COMMENT 'Purchase order number',
  `status` enum('draft', 'sent', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'draft',
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total order amount',
  `expected_delivery` date DEFAULT NULL COMMENT 'Expected delivery date',
  `notes` text DEFAULT NULL COMMENT 'Order notes',
  `created_by` int(11) NOT NULL COMMENT 'Admin user who created order',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_order_number` (`order_number`) COMMENT 'Prevent duplicate order numbers',
  KEY `idx_supplier_id` (`supplier_id`) COMMENT 'Supplier lookup',
  KEY `idx_status` (`status`) COMMENT 'Status filtering',
  KEY `idx_created_at` (`created_at`) COMMENT 'Date filtering',
  CONSTRAINT `fk_purchase_orders_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_purchase_orders_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Purchase orders to suppliers';

CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int(11) NOT NULL COMMENT 'Reference to purchase_orders table',
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `quantity` int(11) NOT NULL COMMENT 'Quantity ordered',
  `unit_price` decimal(10,2) NOT NULL COMMENT 'Price per unit',
  `total_price` decimal(10,2) NOT NULL COMMENT 'Total price (quantity * unit_price)',
  `received_quantity` int(11) NOT NULL DEFAULT 0 COMMENT 'Quantity received so far',
  PRIMARY KEY (`id`),
  KEY `idx_purchase_order_id` (`purchase_order_id`) COMMENT 'Purchase order lookup',
  KEY `idx_product_id` (`product_id`) COMMENT 'Product lookup',
  CONSTRAINT `fk_purchase_order_items_order` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_purchase_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items in purchase orders';

CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `movement_type` enum('in', 'out', 'adjustment', 'transfer') NOT NULL COMMENT 'Type of movement',
  `quantity` int(11) NOT NULL COMMENT 'Quantity moved (positive for in, negative for out)',
  `reference_type` enum('order', 'purchase', 'adjustment', 'reservation', 'loss') DEFAULT NULL COMMENT 'Type of reference',
  `reference_id` int(11) DEFAULT NULL COMMENT 'ID of reference record',
  `reason` varchar(255) DEFAULT NULL COMMENT 'Reason for movement',
  `user_id` int(11) DEFAULT NULL COMMENT 'User who made the movement',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`) COMMENT 'Product lookup',
  KEY `idx_movement_type` (`movement_type`) COMMENT 'Type filtering',
  KEY `idx_created_at` (`created_at`) COMMENT 'Date filtering',
  KEY `idx_reference` (`reference_type`, `reference_id`) COMMENT 'Reference lookup',
  CONSTRAINT `fk_inventory_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inventory_movements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track all inventory movements';

CREATE TABLE IF NOT EXISTS `low_stock_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `current_stock` int(11) NOT NULL COMMENT 'Current stock level',
  `threshold` int(11) NOT NULL COMMENT 'Alert threshold',
  `alert_sent` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether alert has been sent',
  `last_alert_at` timestamp NULL DEFAULT NULL COMMENT 'When last alert was sent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_alert` (`product_id`) COMMENT 'One alert per product',
  KEY `idx_alert_sent` (`alert_sent`) COMMENT 'Find unsent alerts',
  KEY `idx_threshold` (`threshold`) COMMENT 'Threshold filtering',
  CONSTRAINT `fk_low_stock_alerts_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Low stock alert tracking';
