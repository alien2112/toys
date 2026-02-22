-- Add database constraints and missing indexes
-- Migration: 2024-02-22_add_db_constraints.sql

-- ============================================
-- Constraint: price must be greater than 0
-- ============================================
ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price > 0);

-- ============================================
-- Constraint: stock must be 0 or more (never negative)
-- ============================================
ALTER TABLE products ADD CONSTRAINT chk_stock_non_negative CHECK (stock >= 0);

-- ============================================
-- Constraint: order total must be greater than 0
-- ============================================
ALTER TABLE orders ADD CONSTRAINT chk_order_total_positive CHECK (total_amount > 0);

-- ============================================
-- Constraint: order_items quantity must be at least 1
-- ============================================
ALTER TABLE order_items ADD CONSTRAINT chk_item_quantity_positive CHECK (quantity > 0);

-- ============================================
-- Constraint: order_items price must be greater than 0
-- ============================================
ALTER TABLE order_items ADD CONSTRAINT chk_item_price_positive CHECK (price > 0);

-- ============================================
-- Constraint: cart quantity must be at least 1
-- ============================================
ALTER TABLE cart ADD CONSTRAINT chk_cart_quantity_positive CHECK (quantity > 0);

-- ============================================
-- Constraint: payment amount must be greater than 0
-- ============================================
ALTER TABLE payments ADD CONSTRAINT chk_payment_amount_positive CHECK (amount > 0);

-- ============================================
-- Missing index: orders.created_at for date range queries
-- ============================================
ALTER TABLE orders ADD INDEX idx_created_at (created_at);

-- ============================================
-- Missing index: products.price for price range filtering
-- ============================================
ALTER TABLE products ADD INDEX idx_price (price);

-- ============================================
-- Missing index: products.stock for low-stock queries
-- ============================================
ALTER TABLE products ADD INDEX idx_stock (stock);

-- ============================================
-- Missing index: payments.order_id
-- ============================================
ALTER TABLE payments ADD INDEX idx_payment_order (order_id);
