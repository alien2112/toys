-- Fix order status enum to include all required statuses
-- Migration: 2024-02-22_fix_order_status_enum.sql

ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending';

-- Update existing records to use correct status names
UPDATE orders SET status = 'processing' WHERE status = 'processed';
UPDATE orders SET status = 'shipped' WHERE status = 'shipping';
