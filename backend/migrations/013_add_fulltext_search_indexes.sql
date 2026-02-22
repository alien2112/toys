-- Add full-text search indexes for better search performance
-- Migration: 2024-02-22_add_fulltext_search_indexes.sql

-- Create full-text index for product search
ALTER TABLE products ADD FULLTEXT(name, description);

-- Add index for better search performance
ALTER TABLE products ADD INDEX idx_search_name (name);
ALTER TABLE products ADD INDEX idx_search_description (description);

-- Add index for sorting performance
ALTER TABLE products ADD INDEX idx_sort_name (name);
ALTER TABLE products ADD INDEX idx_sort_price (price);
ALTER TABLE products ADD INDEX idx_sort_stock (stock);

-- Add composite index for category + active + featured for better filtering
ALTER TABLE products ADD INDEX idx_category_active_featured (category_id, is_active, is_featured);

-- Add index for created_at sorting (if not exists)
ALTER TABLE products ADD INDEX idx_created_at_desc (created_at DESC);
