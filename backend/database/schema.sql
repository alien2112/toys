CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

CREATE TABLE users (
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

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
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

CREATE TABLE orders (
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

CREATE TABLE order_items (
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

CREATE TABLE reviews (
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

CREATE TABLE cart (
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

INSERT INTO categories (name, slug, description) VALUES
('سيارات', 'cars', 'سيارات لعب متنوعة'),
('بالونات', 'balloons', 'بالونات ملونة للحفلات'),
('ديناصورات', 'dinosaurs', 'ديناصورات واقعية'),
('فضاء', 'space', 'ألعاب الفضاء والصواريخ');

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

CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'),
('user@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'User', 'user');

INSERT INTO settings (setting_key, setting_value) VALUES
('social_facebook', '#'),
('social_instagram', '#'),
('social_whatsapp', '#'),
('contact_email', 'support@amanlove.com'),
('contact_phone', '+965 1234 5678'),
('contact_whatsapp', '+96512345678'),
('contact_address', 'الكويت'),
('contact_hours', 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً');

INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(1, 2, 5, 'سيارة رائعة جداً! ابني يحبها كثيراً والبطارية تدوم طويلاً. جودة ممتازة وسعر مناسب.'),
(1, 2, 4, 'منتج جيد ولكن التوصيل كان متأخراً قليلاً. السيارة نفسها ممتازة والأطفال سعداء بها.'),
(1, 2, 5, 'أفضل لعبة اشتريتها لأطفالي! السرعة ممتازة والتحكم سهل جداً.'),
(2, 2, 5, 'بالون جميل جداً وألوانه زاهية. استخدمته في حفلة ابنتي وكان رائعاً.'),
(2, 2, 4, 'جودة جيدة وبقي منتفخاً لأكثر من أسبوع. أنصح به للحفلات.'),
(3, 2, 5, 'ديناصور رائع! الأصوات واقعية جداً وابني لا يتوقف عن اللعب به.'),
(3, 2, 5, 'جودة ممتازة وتفاصيل دقيقة. يستحق السعر تماماً.'),
(4, 2, 4, 'صاروخ جميل والأضواء رائعة. الأطفال يحبونه كثيراً.');
