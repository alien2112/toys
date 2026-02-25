-- Migration: Add Product Variants Support
-- This migration adds tables for product variants and variant options

USE ecommerce_db;

-- Table for variant types (e.g., Color, Size, Material)
CREATE TABLE variant_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for variant options (e.g., Red, Blue, Small, Large)
CREATE TABLE variant_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_type_id INT NOT NULL,
    value VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_type_id) REFERENCES variant_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variant_option (variant_type_id, slug),
    INDEX idx_variant_type (variant_type_id),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for product variants
CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_sku (sku),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Junction table for product variant options (many-to-many relationship)
CREATE TABLE product_variant_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    variant_option_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_option_id) REFERENCES variant_options(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variant_option (variant_id, variant_option_id),
    INDEX idx_variant (variant_id),
    INDEX idx_variant_option (variant_option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update cart table to support variants
ALTER TABLE cart 
ADD COLUMN variant_id INT NULL,
ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
DROP INDEX unique_user_product,
ADD UNIQUE KEY unique_user_product_variant (user_id, product_id, variant_id);

-- Update order_items table to support variants
ALTER TABLE order_items
ADD COLUMN variant_id INT NULL,
ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- Insert default variant types
INSERT INTO variant_types (name, slug) VALUES
('اللون', 'color'),
('الحجم', 'size'),
('المادة', 'material');

-- Insert some common variant options
INSERT INTO variant_options (variant_type_id, value, slug) VALUES
-- Color options
(1, 'أحمر', 'red'),
(1, 'أزرق', 'blue'),
(1, 'أخضر', 'green'),
(1, 'أصفر', 'yellow'),
(1, 'أسود', 'black'),
(1, 'أبيض', 'white'),
(1, 'وردي', 'pink'),
(1, 'بنفسجي', 'purple'),
-- Size options
(2, 'صغير', 'small'),
(2, 'متوسط', 'medium'),
(2, 'كبير', 'large'),
(2, 'صغير جداً', 'x-small'),
(2, 'كبير جداً', 'x-large'),
-- Material options
(3, 'بلاستيك', 'plastic'),
(3, 'خشب', 'wood'),
(3, 'معدن', 'metal'),
(3, 'قماش', 'fabric'),
(3, 'مطاط', 'rubber');

-- Add a flag to products table to indicate if they have variants
ALTER TABLE products 
ADD COLUMN has_variants BOOLEAN DEFAULT FALSE,
ADD INDEX idx_has_variants (has_variants);
