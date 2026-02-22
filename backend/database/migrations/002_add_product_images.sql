USE ecommerce_db;

-- Create product_images table for multiple image storage
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create directories for image storage
-- This will be handled by the PHP script
