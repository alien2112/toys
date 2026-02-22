-- Analytics & Reporting System Schema
USE ecommerce_db;

-- Analytics Events Tracking Table
CREATE TABLE analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    user_id INT NULL,
    event_type ENUM('page_view', 'product_view', 'add_to_cart', 'checkout_started', 'purchase_completed', 'search', 'category_view', 'cart_abandoned') NOT NULL,
    event_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_user (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily Sales Summary Table (for performance)
CREATE TABLE daily_sales_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_orders INT NOT NULL DEFAULT 0,
    total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_customers INT NOT NULL DEFAULT 0,
    average_order_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    unique_visitors INT NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Analytics Summary Table
CREATE TABLE product_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    date DATE NOT NULL,
    views INT NOT NULL DEFAULT 0,
    add_to_carts INT NOT NULL DEFAULT 0,
    purchases INT NOT NULL DEFAULT 0,
    revenue DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    conversion_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product_date (product_id, date),
    INDEX idx_product (product_id),
    INDEX idx_date (date),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer Behavior Summary Table
CREATE TABLE customer_behavior (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    session_duration INT NOT NULL DEFAULT 0, -- in seconds
    pages_viewed INT NOT NULL DEFAULT 0,
    products_viewed INT NOT NULL DEFAULT 0,
    cart_additions INT NOT NULL DEFAULT 0,
    checkout_started BOOLEAN DEFAULT FALSE,
    purchase_completed BOOLEAN DEFAULT FALSE,
    total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user (user_id),
    INDEX idx_date (date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory Analytics Table
CREATE TABLE inventory_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    date DATE NOT NULL,
    opening_stock INT NOT NULL DEFAULT 0,
    closing_stock INT NOT NULL DEFAULT 0,
    units_sold INT NOT NULL DEFAULT 0,
    turnover_rate DECIMAL(8, 4) NOT NULL DEFAULT 0.0000,
    days_of_supply INT NOT NULL DEFAULT 0,
    reorder_level BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product_date (product_id, date),
    INDEX idx_product (product_id),
    INDEX idx_date (date),
    INDEX idx_reorder (reorder_level),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversion Funnel Table
CREATE TABLE conversion_funnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    visitors INT NOT NULL DEFAULT 0,
    product_views INT NOT NULL DEFAULT 0,
    add_to_carts INT NOT NULL DEFAULT 0,
    checkout_started INT NOT NULL DEFAULT 0,
    purchases INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance optimization
CREATE INDEX idx_analytics_events_composite ON analytics_events (event_type, created_at, session_id);
CREATE INDEX idx_product_analytics_composite ON product_analytics (product_id, date, views);
CREATE INDEX idx_daily_sales_composite ON daily_sales_summary (date, total_revenue);

-- Create view for real-time analytics
CREATE VIEW analytics_overview AS
SELECT 
    DATE(o.created_at) as date,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    COUNT(DISTINCT o.user_id) as total_customers,
    AVG(o.total_amount) as average_order_value,
    COUNT(DISTINCT ae.session_id) as unique_visitors,
    ROUND(COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT ae.session_id), 0) * 100, 2) as conversion_rate
FROM orders o
LEFT JOIN analytics_events ae ON DATE(o.created_at) = DATE(ae.created_at) 
    AND ae.event_type = 'page_view'
WHERE o.status != 'cancelled'
GROUP BY DATE(o.created_at);

-- Create stored procedure for daily summary updates
DELIMITER //
CREATE PROCEDURE UpdateDailySalesSummary(IN target_date DATE)
BEGIN
    INSERT INTO daily_sales_summary (
        date, total_orders, total_revenue, total_customers, 
        average_order_value, unique_visitors, conversion_rate
    )
    SELECT 
        target_date,
        COUNT(DISTINCT o.id),
        COALESCE(SUM(o.total_amount), 0),
        COUNT(DISTINCT o.user_id),
        COALESCE(AVG(o.total_amount), 0),
        COUNT(DISTINCT ae.session_id),
        ROUND(COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT ae.session_id), 0) * 100, 2)
    FROM orders o
    LEFT JOIN analytics_events ae ON DATE(o.created_at) = target_date 
        AND DATE(ae.created_at) = target_date
        AND ae.event_type = 'page_view'
    WHERE DATE(o.created_at) = target_date AND o.status != 'cancelled'
    ON DUPLICATE KEY UPDATE
        total_orders = VALUES(total_orders),
        total_revenue = VALUES(total_revenue),
        total_customers = VALUES(total_customers),
        average_order_value = VALUES(average_order_value),
        unique_visitors = VALUES(unique_visitors),
        conversion_rate = VALUES(conversion_rate);
END //
DELIMITER ;

-- Create stored procedure for product analytics updates
DELIMITER //
CREATE PROCEDURE UpdateProductAnalytics(IN target_date DATE)
BEGIN
    INSERT INTO product_analytics (
        product_id, date, views, add_to_carts, purchases, 
        revenue, conversion_rate
    )
    SELECT 
        p.id,
        target_date,
        COALESCE(SUM(CASE WHEN ae.event_type = 'product_view' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN ae.event_type = 'add_to_cart' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity * oi.price ELSE 0 END), 0),
        ROUND(
            COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0) / 
            NULLIF(COALESCE(SUM(CASE WHEN ae.event_type = 'product_view' THEN 1 ELSE 0 END), 0), 0) * 100, 
            2
        )
    FROM products p
    LEFT JOIN analytics_events ae ON JSON_UNQUOTE(JSON_EXTRACT(ae.event_data, '$.product_id')) = p.id 
        AND DATE(ae.created_at) = target_date
        AND ae.event_type IN ('product_view', 'add_to_cart')
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id 
        AND DATE(o.created_at) = target_date 
        AND o.status != 'cancelled'
    GROUP BY p.id
    ON DUPLICATE KEY UPDATE
        views = VALUES(views),
        add_to_carts = VALUES(add_to_carts),
        purchases = VALUES(purchases),
        revenue = VALUES(revenue),
        conversion_rate = VALUES(conversion_rate);
END //
DELIMITER ;

-- Create stored procedure for inventory analytics updates
DELIMITER //
CREATE PROCEDURE UpdateInventoryAnalytics(IN target_date DATE)
BEGIN
    INSERT INTO inventory_analytics (
        product_id, date, opening_stock, closing_stock, 
        units_sold, turnover_rate, days_of_supply, reorder_level
    )
    SELECT 
        p.id,
        target_date,
        COALESCE(p.stock + COALESCE(sold.units_sold, 0), 0) as opening_stock,
        p.stock as closing_stock,
        COALESCE(sold.units_sold, 0) as units_sold,
        ROUND(
            COALESCE(sold.units_sold, 0) / 
            NULLIF((p.stock + COALESCE(sold.units_sold, 0) + p.stock) / 2, 0), 
            4
        ) as turnover_rate,
        CASE 
            WHEN COALESCE(sold.units_sold, 0) > 0 
            THEN FLOOR(p.stock / (COALESCE(sold.units_sold, 0) / 30))
            ELSE 999 
        END as days_of_supply,
        p.stock <= 10 as reorder_level
    FROM products p
    LEFT JOIN (
        SELECT 
            oi.product_id,
            SUM(oi.quantity) as units_sold
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) = target_date AND o.status != 'cancelled'
        GROUP BY oi.product_id
    ) sold ON p.id = sold.product_id
    ON DUPLICATE KEY UPDATE
        opening_stock = VALUES(opening_stock),
        closing_stock = VALUES(closing_stock),
        units_sold = VALUES(units_sold),
        turnover_rate = VALUES(turnover_rate),
        days_of_supply = VALUES(days_of_supply),
        reorder_level = VALUES(reorder_level);
END //
DELIMITER ;
