-- Update orders table to match new status flow
-- This migration updates the status enum to use the required values

-- First, update any existing records to use new status values
UPDATE orders SET status = 'processed' WHERE status = 'processing';
UPDATE orders SET status = 'shipping' WHERE status = 'shipped';

-- Modify the status column to use the new enum values
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'processed', 'shipping', 'delivered', 'cancelled') 
NOT NULL DEFAULT 'pending';

-- Create order_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    old_status VARCHAR(20) DEFAULT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by INT DEFAULT NULL, -- admin user ID who made the change
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_order_id (order_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
);

-- Add index for better performance on status queries
ALTER TABLE orders ADD INDEX idx_status_created (status, created_at);
