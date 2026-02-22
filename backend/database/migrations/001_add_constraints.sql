-- Migration 001: Add missing constraints and tables for production
-- This file adds critical database constraints and new tables needed for production

START TRANSACTION;

-- 1. Add CHECK constraint on products.stock to prevent negative stock
-- Add stock >= 0 constraint
ALTER TABLE products 
ADD CONSTRAINT chk_stock_positive 
CHECK (stock >= 0);

-- 2. Add idempotency_key to orders table to prevent duplicate submissions
ALTER TABLE orders 
ADD COLUMN idempotency_key VARCHAR(64) NULL AFTER shipping_address;

-- Add unique index on idempotency_key
ALTER TABLE orders 
ADD UNIQUE INDEX idx_idempotency_key (idempotency_key);

-- 3. Extend orders.status enum to include 'paid' and 'refunded'
-- MySQL doesn't support ALTER ENUM directly, so we need to modify the column
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') 
DEFAULT 'pending' 
NOT NULL;

-- 4. Create payments table for payment gateway integration
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    gateway VARCHAR(50) NOT NULL COMMENT 'e.g. moyasar, stripe, cod',
    gateway_ref VARCHAR(255) NULL COMMENT 'transaction ID from payment gateway',
    status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
    raw_response JSON NULL COMMENT 'store the full gateway callback for audit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    
    -- Indexes for performance
    INDEX idx_order_id (order_id),
    INDEX idx_gateway_ref (gateway_ref),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create audit_logs table for tracking important changes
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL COMMENT 'e.g. order, user, product, category',
    entity_id INT NOT NULL,
    action VARCHAR(100) NOT NULL COMMENT 'e.g. status_changed, role_changed, stock_updated',
    old_value JSON NULL,
    new_value JSON NULL,
    performed_by INT NULL COMMENT 'user_id of admin who did it, NULL for system actions',
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint for performed_by
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_performed_by (performed_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
