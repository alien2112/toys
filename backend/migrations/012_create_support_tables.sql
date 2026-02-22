-- Create customer support tables
-- Migration: 2024-02-22_create_support_tables.sql

CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(20) NOT NULL COMMENT 'Unique ticket number',
  `user_id` int(11) NOT NULL COMMENT 'Customer who created ticket',
  `subject` varchar(255) NOT NULL COMMENT 'Ticket subject',
  `description` text NOT NULL COMMENT 'Ticket description',
  `category` enum('order', 'payment', 'product', 'shipping', 'return', 'technical', 'other') NOT NULL DEFAULT 'other',
  `priority` enum('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  `status` enum('open', 'in_progress', 'waiting_customer', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  `assigned_to` int(11) DEFAULT NULL COMMENT 'Admin user assigned to ticket',
  `order_id` int(11) DEFAULT NULL COMMENT 'Related order if applicable',
  `product_id` int(11) DEFAULT NULL COMMENT 'Related product if applicable',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL COMMENT 'When ticket was resolved',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ticket_number` (`ticket_number`) COMMENT 'Prevent duplicate ticket numbers',
  KEY `idx_user_id` (`user_id`) COMMENT 'Customer lookup',
  KEY `idx_status` (`status`) COMMENT 'Status filtering',
  KEY `idx_category` (`category`) COMMENT 'Category filtering',
  KEY `idx_priority` (`priority`) COMMENT 'Priority filtering',
  KEY `idx_assigned_to` (`assigned_to`) COMMENT 'Assignment lookup',
  KEY `idx_created_at` (`created_at`) COMMENT 'Date filtering',
  CONSTRAINT `fk_support_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_support_tickets_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_support_tickets_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_support_tickets_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Customer support tickets';

CREATE TABLE IF NOT EXISTS `ticket_replies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL COMMENT 'Reference to support_tickets table',
  `user_id` int(11) DEFAULT NULL COMMENT 'User who replied (null for system)',
  `is_admin` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether reply is from admin',
  `message` text NOT NULL COMMENT 'Reply message',
  `attachments` json DEFAULT NULL COMMENT 'Array of attachment file paths',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ticket_id` (`ticket_id`) COMMENT 'Ticket lookup',
  KEY `idx_user_id` (`user_id`) COMMENT 'User lookup',
  KEY `idx_created_at` (`created_at`) COMMENT 'Date sorting',
  CONSTRAINT `fk_ticket_replies_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ticket_replies_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ticket conversation history';

CREATE TABLE IF NOT EXISTS `support_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Category name',
  `description` text DEFAULT NULL COMMENT 'Category description',
  `color` varchar(7) DEFAULT '#6B7280' COMMENT 'Hex color code',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether category is active',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Display order',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`) COMMENT 'Active filter',
  KEY `idx_sort_order` (`sort_order`) COMMENT 'Order sorting'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Support ticket categories';

CREATE TABLE IF NOT EXISTS `chat_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) NOT NULL COMMENT 'Unique session identifier',
  `user_id` int(11) DEFAULT NULL COMMENT 'User if logged in',
  `visitor_ip` varchar(45) NOT NULL COMMENT 'Visitor IP address',
  `user_agent` text DEFAULT NULL COMMENT 'Browser user agent',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NULL DEFAULT NULL COMMENT 'When session ended',
  `status` enum('active', 'ended', 'transferred') NOT NULL DEFAULT 'active',
  `assigned_agent` int(11) DEFAULT NULL COMMENT 'Admin agent assigned',
  `rating` tinyint(1) DEFAULT NULL COMMENT 'Session rating 1-5',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session_id` (`session_id`) COMMENT 'Prevent duplicate sessions',
  KEY `idx_user_id` (`user_id`) COMMENT 'User lookup',
  KEY `idx_status` (`status`) COMMENT 'Status filtering',
  KEY `idx_started_at` (`started_at`) COMMENT 'Date filtering',
  CONSTRAINT `fk_chat_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_sessions_agent` FOREIGN KEY (`assigned_agent`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Live chat sessions';

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL COMMENT 'Reference to chat_sessions table',
  `sender_type` enum('user', 'agent', 'system') NOT NULL COMMENT 'Who sent the message',
  `sender_id` int(11) DEFAULT NULL COMMENT 'ID of sender (user or agent)',
  `message` text NOT NULL COMMENT 'Message content',
  `attachments` json DEFAULT NULL COMMENT 'Array of attachment file paths',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether message has been read',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`) COMMENT 'Session lookup',
  KEY `idx_sender` (`sender_type`, `sender_id`) COMMENT 'Sender lookup',
  KEY `idx_created_at` (`created_at`) COMMENT 'Date sorting',
  CONSTRAINT `fk_chat_messages_session` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Live chat messages';

-- Insert default support categories
INSERT IGNORE INTO support_categories (name, description, color, sort_order) VALUES
('Order Issues', 'Problems with orders, shipping, and delivery', '#EF4444', 1),
('Payment Problems', 'Issues with payments, refunds, and billing', '#F59E0B', 2),
('Product Questions', 'Questions about products, features, and specifications', '#3B82F6', 3),
('Technical Support', 'Website errors, account issues, and technical problems', '#8B5CF6', 4),
('Returns & Refunds', 'Product returns, exchanges, and refund requests', '#10B981', 5),
('General Inquiry', 'General questions and other inquiries', '#6B7280', 6);
