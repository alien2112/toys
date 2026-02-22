-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar VARCHAR(255) DEFAULT NULL,
    author_bio TEXT DEFAULT NULL,
    author_credentials VARCHAR(255) DEFAULT NULL,
    author_social JSON DEFAULT NULL,
    featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    image_url VARCHAR(255) DEFAULT NULL,
    tags JSON DEFAULT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    views INT DEFAULT 0,
    read_time VARCHAR(20) DEFAULT NULL,
    published_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_featured (featured),
    INDEX idx_published_at (published_at),
    INDEX idx_views (views),
    FULLTEXT idx_search (title, summary, content)
);

-- Create blog_categories table for better category management
CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    color VARCHAR(7) DEFAULT '#FFD700',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create blog_tags table for tag management
CREATE TABLE IF NOT EXISTS blog_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pivot table for blog-tag relationships
CREATE TABLE IF NOT EXISTS blog_tag_relations (
    blog_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (blog_id, tag_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
('نصائح تربوية', 'parenting-tips', 'نصائح وإرشادات لتربية الأطفال', '#FF6B6B'),
('تطوير المهارات', 'skill-development', 'مقالات حول تطوير مهارات الأطفال', '#4ECDC4'),
('اختيار الألعاب', 'toy-selection', 'دليل اختيار الألعاب المناسبة', '#FFD700'),
('أنشطة منزلية', 'home-activities', 'أفكار لأنشطة ممتعة في المنزل', '#95E77E'),
('السلامة والأمان', 'safety-security', 'معايير السلامة ونصائح الأمان', '#FF8C42');

-- Insert default tags
INSERT INTO blog_tags (name, slug) VALUES
('تربية', 'parenting'),
('ألعاب تعليمية', 'educational-toys'),
('تطوير المهارات', 'skill-development'),
('النمو العقلي', 'mental-growth'),
('السلامة', 'safety'),
('إبداع', 'creativity'),
('تعلم', 'learning'),
('لعب', 'play'),
('طفولة', 'childhood'),
('تنمية', 'development');
