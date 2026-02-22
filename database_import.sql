-- ============================================
-- E-COMMERCE DATABASE IMPORT FILE
-- Complete database structure and sample data
-- Compatible with MySQL 8.0+
-- ============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE ecommerce_db;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    image_url VARCHAR(500),
    stock INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product images table (for multiple images)
CREATE TABLE IF NOT EXISTS product_images (
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

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT 'Reference to orders table',
    amount DECIMAL(10,2) NOT NULL COMMENT 'Payment amount',
    currency VARCHAR(10) NOT NULL DEFAULT 'KWD' COMMENT 'Currency code',
    gateway ENUM('moyasar','stripe','cod') NOT NULL COMMENT 'Payment gateway used',
    gateway_ref VARCHAR(255) DEFAULT NULL COMMENT 'Gateway transaction reference',
    status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT 'Payment status',
    raw_response TEXT DEFAULT NULL COMMENT 'Raw response from payment gateway',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_gateway_ref (gateway_ref) COMMENT 'Prevent duplicate payment records',
    KEY idx_order_id (order_id) COMMENT 'Fast order lookup',
    KEY idx_status (status) COMMENT 'Status filtering',
    KEY idx_gateway (gateway) COMMENT 'Gateway filtering',
    KEY idx_created_at (created_at) COMMENT 'Date-based sorting',
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payment transactions with gateway integration';

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WISHLIST TABLES
-- ============================================

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Owner of the wishlist',
    name VARCHAR(255) NOT NULL DEFAULT 'My Wishlist' COMMENT 'Wishlist name',
    slug VARCHAR(255) DEFAULT NULL COMMENT 'URL-friendly slug for sharing',
    is_public TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether wishlist is publicly shareable',
    share_token VARCHAR(64) DEFAULT NULL COMMENT 'Unique token for sharing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_share_token (share_token) COMMENT 'Prevent duplicate share tokens',
    KEY idx_user_id (user_id) COMMENT 'Fast user lookup',
    KEY idx_slug (slug) COMMENT 'Slug lookup for public sharing',
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User wishlists with sharing support';

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wishlist_id INT NOT NULL COMMENT 'Reference to wishlists table',
    product_id INT NOT NULL COMMENT 'Reference to products table',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When item was added',
    stock_alert TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether to notify when back in stock',
    UNIQUE KEY unique_wishlist_product (wishlist_id, product_id) COMMENT 'Prevent duplicates',
    KEY idx_wishlist_id (wishlist_id) COMMENT 'Fast wishlist lookup',
    KEY idx_product_id (product_id) COMMENT 'Product lookup',
    KEY idx_stock_alert (stock_alert) COMMENT 'Stock alert filtering',
    CONSTRAINT fk_wishlist_items_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_wishlist_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items in user wishlists with stock alerts';

-- ============================================
-- SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('سيارات', 'cars', 'سيارات لعب متنوعة'),
('بالونات', 'balloons', 'بالونات ملونة للحفلات'),
('ديناصورات', 'dinosaurs', 'ديناصورات واقعية'),
('فضاء', 'space', 'ألعاب الفضاء والصواريخ');

-- Insert products
INSERT INTO products (name, slug, description, price, category_id, image_url, stock, is_featured) VALUES
('سيارة سباق كهربائية', 'electric-racing-car', 'سيارة سباق بتحكم عن بعد مع بطارية قابلة للشحن وسرعة عالية للمتعة القصوى.', 299.99, 1, '/products/car.svg', 15, TRUE),
('بالون حرف K', 'balloon-k', 'بالون ملون على شكل حرف K مثالي للاحتفالات وأعياد الميلاد.', 49.99, 2, '/products/balloon-k.svg', 45, TRUE),
('ديناصور تيريكس', 'dinosaur-trex', 'لعبة ديناصور واقعية مع أصوات وحركات مثيرة للأطفال المحبين للديناصورات.', 189.99, 3, '/products/dinosaur.svg', 8, TRUE),
('سفينة فضاء صاروخية', 'rocket-spaceship', 'صاروخ فضائي مع أضواء وأصوات واقعية لمغامرات الفضاء الخيالية.', 249.99, 4, '/products/spaceship.svg', 12, TRUE),
('سيارة رياضية حمراء', 'red-sports-car', 'سيارة رياضية أنيقة بتصميم عصري وعجلات قوية للعب الممتع.', 159.99, 1, '/products/car.svg', 23, FALSE),
('مجموعة بالونات ملونة', 'colorful-balloons-set', 'مجموعة من البالونات الملونة المتنوعة لتزيين الحفلات والمناسبات.', 79.99, 2, '/products/balloon-k.svg', 67, FALSE),
('ديناصور فيلوسيرابتور', 'velociraptor-dinosaur', 'ديناصور سريع ومرن مع تفاصيل دقيقة وألوان جذابة.', 139.99, 3, '/products/dinosaur.svg', 18, FALSE),
('محطة فضاء دولية', 'space-station', 'محطة فضاء قابلة للتركيب مع رواد فضاء ومعدات استكشاف.', 349.99, 4, '/products/spaceship.svg', 6, FALSE),
('سيارة شرطة', 'police-car', 'سيارة شرطة مع صفارة إنذار وأضواء وامضة للعب الواقعي.', 179.99, 1, '/products/car.svg', 34, FALSE),
('بالون قلب أحمر', 'red-heart-balloon', 'بالون على شكل قلب مثالي للتعبير عن الحب في المناسبات الخاصة.', 39.99, 2, '/products/balloon-k.svg', 89, FALSE),
('ديناصور ترايسيراتوبس', 'triceratops-dinosaur', 'ديناصور بثلاثة قرون مع تفاصيل واقعية وحجم مناسب للأطفال.', 169.99, 3, '/products/dinosaur.svg', 21, FALSE),
('مكوك فضائي', 'space-shuttle', 'مكوك فضائي قابل للإطلاق مع منصة إطلاق وملحقات متنوعة.', 279.99, 4, '/products/spaceship.svg', 14, FALSE);

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, image_path, alt_text, sort_order) VALUES
(1, '/products/car.svg', '/images/products/car-1.svg', 'سيارة سباق كهربائية', 0),
(2, '/products/balloon-k.svg', '/images/products/balloon-k-1.svg', 'بالون حرف K', 0),
(3, '/products/dinosaur.svg', '/images/products/dinosaur-1.svg', 'ديناصور تيريكس', 0),
(4, '/products/spaceship.svg', '/images/products/spaceship-1.svg', 'سفينة فضاء صاروخية', 0);

-- Insert users (password is 'password' for both)
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'),
('user@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'User', 'user');

-- Insert settings
INSERT INTO settings (setting_key, setting_value) VALUES
('social_facebook', '#'),
('social_instagram', '#'),
('social_whatsapp', '#'),
('contact_email', 'support@amanlove.com'),
('contact_phone', '+965 1234 5678'),
('contact_whatsapp', '+96512345678'),
('contact_address', 'الكويت'),
('contact_hours', 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً'),
('header_logo_url', ''),
('footer_logo_url', '');

-- Insert reviews
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(1, 2, 5, 'سيارة رائعة جداً! ابني يحبها كثيراً والبطارية تدوم طويلاً. جودة ممتازة وسعر مناسب.'),
(1, 2, 4, 'منتج جيد ولكن التوصيل كان متأخراً قليلاً. السيارة نفسها ممتازة والأطفال سعداء بها.'),
(1, 2, 5, 'أفضل لعبة اشتريتها لأطفالي! السرعة ممتازة والتحكم سهل جداً.'),
(2, 2, 5, 'بالون جميل جداً وألوانه زاهية. استخدمته في حفلة ابنتي وكان رائعاً.'),
(2, 2, 4, 'جودة جيدة وبقي منتفخاً لأكثر من أسبوع. أنصح به للحفلات.'),
(3, 2, 5, 'ديناصور رائع! الأصوات واقعية جداً وابني لا يتوقف عن اللعب به.'),
(3, 2, 5, 'جودة ممتازة وتفاصيل دقيقة. يستحق السعر تماماً.'),
(4, 2, 4, 'صاروخ جميل والأضواء رائعة. الأطفال يحبونه كثيراً.');

-- Create default wishlists for users
INSERT INTO wishlists (user_id, name, slug, is_public, share_token) VALUES
(2, 'My Wishlist', 'wishlist-2-1708608000', 0, SHA2(CONCAT(2, UNIX_TIMESTAMP(), RAND()), 256));

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Full-text search indexes
CREATE FULLTEXT INDEX idx_products_search ON products(name, description);
CREATE FULLTEXT INDEX idx_categories_search ON categories(name, description);

-- Performance indexes
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================

-- Product summary view
CREATE OR REPLACE VIEW product_summary AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.stock,
    p.is_featured,
    p.is_active,
    c.name as category_name,
    c.slug as category_slug,
    COUNT(DISTINCT r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as average_rating
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.slug, p.price, p.stock, p.is_featured, p.is_active, c.name, c.slug;

-- Order summary view
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.user_id,
    o.total_amount,
    o.status,
    o.created_at,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.user_id, o.total_amount, o.status, o.created_at, u.first_name, u.last_name, u.email;

-- ============================================
-- CREATE STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure to update product stock safely
CREATE PROCEDURE UpdateProductStock(
    IN p_product_id INT,
    IN p_quantity INT,
    IN p_operation VARCHAR(10) -- 'decrease' or 'increase'
)
BEGIN
    DECLARE current_stock INT;
    DECLARE new_stock INT;
    
    -- Get current stock
    SELECT stock INTO current_stock FROM products WHERE id = p_product_id;
    
    -- Calculate new stock based on operation
    IF p_operation = 'decrease' THEN
        SET new_stock = current_stock - p_quantity;
        IF new_stock < 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';
        END IF;
    ELSEIF p_operation = 'increase' THEN
        SET new_stock = current_stock + p_quantity;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid operation';
    END IF;
    
    -- Update stock
    UPDATE products SET stock = new_stock WHERE id = p_product_id;
    
    -- Return new stock
    SELECT new_stock as updated_stock;
END//

-- Procedure to get user order history
CREATE PROCEDURE GetUserOrderHistory(
    IN p_user_id INT
)
BEGIN
    SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = p_user_id
    GROUP BY o.id, o.total_amount, o.status, o.created_at
    ORDER BY o.created_at DESC;
END//

DELIMITER ;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Trigger to update product stock when order is placed
DELIMITER //
CREATE TRIGGER after_order_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity 
    WHERE id = NEW.product_id;
END//
DELIMITER ;

-- Trigger to restore stock when order is cancelled
DELIMITER //
CREATE TRIGGER after_order_cancel
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE products p
        SET stock = stock + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    END IF;
END//
DELIMITER ;

-- ============================================
-- IMPORT COMPLETE
-- ============================================

-- Display summary
SELECT 
    'Database import completed successfully!' as status,
    COUNT(DISTINCT t.table_name) as tables_created,
    (SELECT COUNT(*) FROM products) as products_imported,
    (SELECT COUNT(*) FROM categories) as categories_imported,
    (SELECT COUNT(*) FROM users) as users_imported
FROM information_schema.tables t
WHERE t.table_schema = 'ecommerce_db';

-- Sample queries to verify data
SELECT '=== SAMPLE DATA VERIFICATION ===' as info;

SELECT 'Categories:' as table_name;
SELECT id, name, slug FROM categories LIMIT 3;

SELECT 'Products:' as table_name;
SELECT id, name, price, stock FROM products LIMIT 3;

SELECT 'Users:' as table_name;
SELECT id, email, role FROM users LIMIT 3;

-- Instructions
SELECT '=== IMPORT INSTRUCTIONS ===' as info;
SELECT '1. Database: ecommerce_db has been created and populated' as step1;
SELECT '2. Default admin user: admin@example.com (password: password)' as step2;
SELECT '3. Default test user: user@example.com (password: password)' as step3;
SELECT '4. All tables are ready for use with proper indexes and constraints' as step4;
SELECT '5. Stored procedures and triggers are configured for stock management' as step5;
