<?php

require_once __DIR__ . '/utils/Database.php';

class BlogSeeder {
    private $db;
    private $blogImages = [
        'blog-tech-trends.jpg',
        'blog-ai-future.jpg', 
        'blog-web-development.jpg',
        'blog-mobile-apps.jpg',
        'blog-cybersecurity.jpg',
        'blog-cloud-computing.jpg',
        'blog-data-science.jpg',
        'blog-startup-guide.jpg',
        'blog-digital-marketing.jpg',
        'blog-ecommerce-tips.jpg',
        'blog-product-design.jpg',
        'blog-user-experience.jpg'
    ];
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Seed blogs with sample data
     */
    public function seedBlogs() {
        echo "Starting blog seeding...\n";
        
        // Clear existing blogs
        $this->clearBlogs();
        
        // Get categories and tags
        $categories = $this->getCategories();
        $tags = $this->getTags();
        
        // Sample blog posts
        $blogs = [
            [
                'title' => 'مستقبل التكنولوجيا في 2024',
                'slug' => 'future-of-technology-2024',
                'excerpt' => 'استكشف أحدث التوجهات التكنولوجية التي ستشكل مستقبلنا في عام 2024 وما بعده.',
                'content' => $this->generateBlogContent('مستقبل التكنولوجيا في 2024', 'تتطور التكنولوجيا بسرعة مذهلة، ومن المتوقع أن نشهد في عام 2024 العديد من الابتكارات التي ستغير طريقة حياتنا وعملنا. من الذكاء الاصطناعي إلى الحوسبة السحابية، سنستكشف في هذا المقال أبرز التوجهات التكنولوجية التي تستحق المتابعة.'),
                'author_name' => 'أحمد محمد',
                'author_avatar' => 'author-1.jpg',
                'author_bio' => 'كاتب متخصص في التكنولوجيا والابتكار',
                'author_social' => json_encode(['twitter' => '@ahmedtech', 'linkedin' => 'ahmed-mohammad']),
                'featured' => 1,
                'category' => $categories['تطوير المهارات'] ?? 'تطوير المهارات',
                'tags' => ['تربية', 'إبداع', 'تعلم'],
                'read_time' => 8,
                'image_url' => 'blog-tech-trends.svg'
            ],
            [
                'title' => 'دليل الآباء لاختيار الألعاب المناسبة',
                'slug' => 'parents-guide-toy-selection',
                'excerpt' => 'نصائح عملية للآباء لاختيار الألعاب المناسبة التي تنمي مهارات أطفالهم.',
                'content' => $this->generateBlogContent('دليل الآباء لاختيار الألعاب المناسبة', 'اختيار اللعبة المناسبة لطفلك هو قرار مهم يؤثر على نموه وتطوره. في هذا الدليل، نقدم للآباء معايير أساسية ونصائح عملية لاختيار الألعاب التي تساعد على تنمية مهارات أطفالهم بشكل صحيح وممتع.'),
                'author_name' => 'سارة العلي',
                'author_avatar' => 'author-2.jpg',
                'author_bio' => 'خبيرة في تنمية الطفولة والتعليم',
                'author_social' => json_encode(['twitter' => '@saraali', 'linkedin' => 'sara-alali']),
                'featured' => 1,
                'category' => $categories['اختيار الألعاب'] ?? 'اختيار الألعاب',
                'tags' => ['ألعاب تعليمية', 'تنمية', 'طفولة'],
                'read_time' => 12,
                'image_url' => 'blog-startup-guide.svg'
            ],
            [
                'title' => 'أنشطة إبداعية في المنزل للأطفال',
                'slug' => 'creative-home-activities-children',
                'excerpt' => 'أفكار لأنشطة ممتعة ومبدعة يمكن القيام بها مع الأطفال في المنزل.',
                'content' => $this->generateBlogContent('أنشطة إبداعية في المنزل للأطفال', 'قضاء الوقت مع الأطفال في أنشطة إبداعية يعزز العلاقة الأسرية وينمي مهاراتهم. في هذا المقال، نقدم مجموعة متنوعة من الأنشطة الممتعة التي يمكن ممارستها في المنزل باستخدام مواد بسيطة ومتوفرة.'),
                'author_name' => 'محمد خالد',
                'author_avatar' => 'author-3.jpg',
                'author_bio' => 'متخصص في الأنشطة التعليمية للأطفال',
                'author_social' => json_encode(['twitter' => '@mohammedkids', 'linkedin' => 'mohammed-khalid']),
                'featured' => 0,
                'category' => $categories['أنشطة منزلية'] ?? 'أنشطة منزلية',
                'tags' => ['إبداع', 'لعب', 'تعلم'],
                'read_time' => 10,
                'image_url' => 'blog-ai-future.svg'
            ],
            [
                'title' => 'معايير السلامة في الألعاب',
                'slug' => 'safety-standards-toys',
                'excerpt' => 'دليل شامل لمعايير السلامة التي يجب مراعاتها عند اختيار ألعاب الأطفال.',
                'content' => $this->generateBlogContent('معايير السلامة في الألعاب', 'سلامة الأطفال هي الأولوية القصوى عند اختيار الألعاب. في هذا المقال، نستعرض المعايير الأساسية للسلامة، والعمر المناسب لكل نوع من الألعاب، وكيفية التأكد من أن اللعبة آمنة لطفلك.'),
                'author_name' => 'فاطمة أحمد',
                'author_avatar' => 'author-4.jpg',
                'author_bio' => 'مستشارة في سلامة الأطفال',
                'author_social' => json_encode(['twitter' => '@ftimasafety', 'linkedin' => 'fatima-ahmed']),
                'featured' => 0,
                'category' => $categories['السلامة والأمان'] ?? 'السلامة والأمان',
                'tags' => ['سلامة', 'طفولة', 'تربية'],
                'read_time' => 15,
                'image_url' => 'blog-web-development.svg'
            ],
            [
                'title' => 'تطوير المهارات الحركية للأطفال',
                'slug' => 'developing-motor-skills-children',
                'excerpt' => 'كيف تساعد الألعاب والأنشطة على تطوير المهارات الحركية الدقيقة وال gross motor.',
                'content' => $this->generateBlogContent('تطوير المهارات الحركية للأطفال', 'المهارات الحركية هي أساس تطور الطفل الجسدي والعقلي. نستكشف في هذا المقال كيف يمكن للألعاب والأنشطة المختلفة أن تساعد في تطوير المهارات الحركية الدقيقة والكبيرة لدى الأطفال في مراحل عمرية مختلفة.'),
                'author_name' => 'نور الدين',
                'author_avatar' => 'author-5.jpg',
                'author_bio' => 'أخصائي علاج طبيعي للأطفال',
                'author_social' => json_encode(['twitter' => '@nourtherapy', 'linkedin' => 'nour-din']),
                'featured' => 1,
                'category' => $categories['تطوير المهارات'] ?? 'تطوير المهارات',
                'tags' => ['تطوير المهارات', 'نمو', 'تعلم'],
                'read_time' => 9,
                'image_url' => 'blog-digital-marketing.svg'
            ],
            [
                'title' => 'أهمية اللعب في تنمية الطفل',
                'slug' => 'importance-play-child-development',
                'excerpt' => 'كيف يؤثر اللعب على النمو العقلي والاجتماعي والعاطفي للأطفال.',
                'content' => $this->generateBlogContent('أهمية اللعب في تنمية الطفل', 'اللعب ليس مجرد متعة، بل هو أداة تعليمية قوية تساهم في تنمية جميع جوانب شخصية الطفل. في هذا المقال، نستكشف الأهمية العلمية للعب وتأثيره على النمو العقلي والاجتماعي والعاطفي للأطفال.'),
                'author_name' => 'عمر حسن',
                'author_avatar' => 'author-6.jpg',
                'author_bio' => 'طبيب أطفال متخصص في النمو',
                'author_social' => json_encode(['twitter' => '@omarpediatric', 'linkedin' => 'omar-hassan']),
                'featured' => 0,
                'category' => $categories['نصائح تربوية'] ?? 'نصائح تربوية',
                'tags' => ['لعب', 'تنمية', 'طفولة'],
                'read_time' => 11,
                'image_url' => 'blog-cybersecurity.svg'
            ],
            [
                'title' => 'اختيار الألعاب حسب العمر',
                'slug' => 'choosing-toys-by-age',
                'excerpt' => 'دليل شامل لاختيار الألعاب المناسبة لكل مرحلة عمرية من الطفولة.',
                'content' => $this->generateBlogContent('اختيار الألعاب حسب العمر', 'كل مرحلة عمرية لها احتياجاتها وقدراتها المختلفة. في هذا الدليل الشامل، نساعد الآباء على اختيار الألعاب المناسبة لأعمار أطفالهم، مع التركيز على الفوائد التنموية لكل نوع من الألعاب.'),
                'author_name' => 'ليلى سعيد',
                'author_avatar' => 'author-7.jpg',
                'author_bio' => 'خبيرة في تطور الطفولة',
                'author_social' => json_encode(['twitter' => '@laylachild', 'dribbble' => 'layla-design']),
                'featured' => 0,
                'category' => $categories['اختيار الألعاب'] ?? 'اختيار الألعاب',
                'tags' => ['ألعاب تعليمية', 'نمو', 'طفولة'],
                'read_time' => 13,
                'image_url' => 'blog-user-experience.svg'
            ],
            [
                'title' => 'أنشطة تنمية الإبداع لدى الأطفال',
                'slug' => 'creativity-development-activities',
                'excerpt' => 'أفكار وأنشطة عملية لتعزيز الإبداع والتفكير الإبداعي لدى الأطفال.',
                'content' => $this->generateBlogContent('أنشطة تنمية الإبداع لدى الأطفال', 'الإبداع مهارة يمكن تنميتها بالممارسة والتحدي. في هذا المقال، نقدم مجموعة من الأنشطة والأفكار العملية التي تساعد الآباء على تعزيز التفكير الإبداعي ومهارات حل المشكلات لدى أطفالهم.'),
                'author_name' => 'خالد عبدالله',
                'author_avatar' => 'author-8.jpg',
                'author_bio' => 'مستشار تربوي متخصص في الإبداع',
                'author_social' => json_encode(['twitter' => '@khaledcreative', 'linkedin' => 'khaled-abdullah']),
                'featured' => 1,
                'category' => $categories['أنشطة منزلية'] ?? 'أنشطة منزلية',
                'tags' => ['إبداع', 'تعلم', 'تنمية'],
                'read_time' => 7,
                'image_url' => 'blog-ecommerce-tips.svg'
            ],
            [
                'title' => 'النمو العقلي من خلال اللعب',
                'slug' => 'mental-growth-through-play',
                'excerpt' => 'كيف تساهم الألعاب المختلفة في تطوير القدرات العقلية والمعرفية للأطفال.',
                'content' => $this->generateBlogContent('النمو العقلي من خلال اللعب', 'اللعب هو الطريقة الطبيعية التي يتعلم بها الأطفال وينمون قدراتهم العقلية. نستكشف في هذا المقال أنواع الألعاب التي تساهم في تطوير الذكاء، والتركيز، والذاكرة، ومهارات حل المشكلات لدى الأطفال.'),
                'author_name' => 'رنا محمود',
                'author_avatar' => 'author-9.jpg',
                'author_bio' => 'باحثة في علم نفس الطفل',
                'author_social' => json_encode(['twitter' => '@ranapsychology', 'linkedin' => 'rana-mahmoud']),
                'featured' => 0,
                'category' => $categories['تطوير المهارات'] ?? 'تطوير المهارات',
                'tags' => ['النمو العقلي', 'تعلم', 'لعب'],
                'read_time' => 14,
                'image_url' => 'blog-cloud-computing.svg'
            ],
            [
                'title' => 'تربية الأطفال في العصر الرقمي',
                'slug' => 'parenting-digital-age',
                'excerpt' => 'نصائح للآباء لتربية أطفالهم بشكل صحي في عصر التكنولوجيا الرقمية.',
                'content' => $this->generateBlogContent('تربية الأطفال في العصر الرقمي', 'التكنولوجيا الرقمية أصبحت جزءاً من حياة أطفالنا، وكيفية التعامل معها تحدي كبير للآباء. في هذا المقال، نقدم استراتيجيات عملية لتربية الأطفال في العصر الرقمي مع تحقيق التوازن بين الاستفادة من التكنولوجيا والحفاظ على الجوانب الأخرى من النمو.'),
                'author_name' => 'ياسر أمين',
                'author_avatar' => 'author-10.jpg',
                'author_bio' => 'خبير في التكنولوجيا التعليمية',
                'author_social' => json_encode(['twitter' => '@yasseredtech', 'github' => 'yasser-ml']),
                'featured' => 0,
                'category' => $categories['نصائح تربوية'] ?? 'نصائح تربوية',
                'tags' => ['تربية', 'تعلم', 'سلامة'],
                'read_time' => 16,
                'image_url' => 'blog-data-science.svg'
            ],
            [
                'title' => 'الألعاب التعليمية وتأثيرها على التعلم',
                'slug' => 'educational-toys-learning-impact',
                'excerpt' => 'كيف تساعد الألعاب التعليمية على تعزيز عملية التعلم وتحسين الأداء الأكاديمي.',
                'content' => $this->generateBlogContent('الألعاب التعليمية وتأثيرها على التعلم', 'الألعاب التعليمية تجعل التعلم ممتعاً وفعالاً. في هذا المقال، نستكشف أنواع الألعاب التعليمية المختلفة، وكيفية اختيار اللعبة المناسبة، والتأثير الإيجابي لهذه الألعاب على التحصيل الدراسي وتنمية المهارات الأكاديمية.'),
                'author_name' => 'مروة سالم',
                'author_avatar' => 'author-11.jpg',
                'author_bio' => 'مختصة في المناهج التعليمية',
                'author_social' => json_encode(['twitter' => '@marwaedu', 'linkedin' => 'marwa-salem']),
                'featured' => 0,
                'category' => $categories['ألعاب تعليمية'] ?? 'تطوير المهارات',
                'tags' => ['ألعاب تعليمية', 'تعلم', 'تنمية'],
                'read_time' => 10,
                'image_url' => 'blog-mobile-apps.svg'
            ],
            [
                'title' => 'تنمية المهارات الاجتماعية عبر اللعب',
                'slug' => 'developing-social-skills-play',
                'excerpt' => 'كيف تساعد الألعاب الجماعية على تنمية المهارات الاجتماعية لدى الأطفال.',
                'content' => $this->generateBlogContent('تنمية المهارات الاجتماعية عبر اللعب', 'المهارات الاجتماعية أساسية لنجاح الطفل في الحياة. في هذا المقال، نستكشف كيف يمكن للعب الجماعي والأنشطة التعاونية أن تساعد في تنمية مهارات التواصل، والتعاون، وحل المشكلات الاجتماعية لدى الأطفال.'),
                'author_name' => 'هاني فارس',
                'author_avatar' => 'author-12.jpg',
                'author_bio' => 'أخصائي نفسي للأطفال والمراهقين',
                'author_social' => json_encode(['twitter' => '@hanytherapy', 'behance' => 'hany-fares']),
                'featured' => 0,
                'category' => $categories['تطوير المهارات'] ?? 'تطوير المهارات',
                'tags' => ['لعب', 'تنمية', 'طفولة'],
                'read_time' => 12,
                'image_url' => 'blog-product-design.svg'
            ]
        ];
        
        // Insert blogs
        $insertedCount = 0;
        foreach ($blogs as $blogData) {
            try {
                $this->insertBlog($blogData);
                $insertedCount++;
                echo "✓ Inserted blog: {$blogData['title']}\n";
            } catch (Exception $e) {
                echo "✗ Error inserting blog '{$blogData['title']}': " . $e->getMessage() . "\n";
            }
        }
        
        echo "\nBlog seeding completed! Inserted {$insertedCount} blogs.\n";
        return $insertedCount;
    }
    
    /**
     * Insert a single blog post
     */
    private function insertBlog($blogData) {
        $stmt = $this->db->prepare("
            INSERT INTO blogs (
                title, slug, summary, content, author_name, author_avatar, 
                author_bio, author_social, featured, category, 
                read_time, image_url, views, status, published_at, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'published', NOW(), NOW(), NOW()
            )
        ");
        
        $stmt->execute([
            $blogData['title'],
            $blogData['slug'],
            $blogData['excerpt'],
            $blogData['content'],
            $blogData['author_name'],
            $blogData['author_avatar'],
            $blogData['author_bio'],
            $blogData['author_social'],
            $blogData['featured'],
            $blogData['category'],
            $blogData['read_time'],
            $blogData['image_url']
        ]);
        
        $blogId = $this->db->lastInsertId();
        
        return $blogId;
    }
    
    /**
     * Generate blog content
     */
    private function generateBlogContent($title, $intro) {
        $sections = [
            'مقدمة',
            'التحديات الرئيسية',
            'الحلول المبتكرة',
            'أفضل الممارسات',
            'النصائح العملية',
            'المستقبل والتوقعات',
            'الخاتمة'
        ];
        
        $content = "<h2>{$title}</h2>\n\n";
        $content .= "<p>{$intro}</p>\n\n";
        
        foreach ($sections as $section) {
            $content .= "<h3>{$section}</h3>\n\n";
            $content .= "<p>هذا قسم {$section} يحتوي على معلومات مفصلة وقيمة حول الموضوع. نستكشف هنا الجوانب المختلفة ونقدم رؤى عميقة تساعد القارئ على فهم الموضوع بشكل شامل.</p>\n\n";
            $content .= "<p>في هذا الجزء، نناقش النقاط الهامة ونقدم أمثلة عملية وتطبيقات واقعية توضح المفاهيم والأفكار المطروحة.</p>\n\n";
        }
        
        return $content;
    }
    
    /**
     * Get categories as associative array
     */
    private function getCategories() {
        $stmt = $this->db->query("SELECT name FROM blog_categories");
        $categories = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categories[strtolower($row['name'])] = $row['name'];
        }
        return $categories;
    }
    
    /**
     * Get tags
     */
    private function getTags() {
        $stmt = $this->db->query("SELECT name FROM blog_tags");
        $tags = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tags[strtolower($row['name'])] = $row['name'];
        }
        return $tags;
    }
    
    /**
     * Generate URL-friendly slug
     */
    private function generateSlug($text) {
        // Convert Arabic and English to URL-friendly format
        $text = preg_replace('/[^a-zA-Z0-9\u0600-\u06FF\s-]/', '', $text);
        $text = preg_replace('/\s+/', '-', $text);
        return strtolower(trim($text, '-'));
    }
    
    /**
     * Clear existing blogs
     */
    private function clearBlogs() {
        echo "Clearing existing blogs...\n";
        
        // Clear blogs
        $this->db->exec("DELETE FROM blogs");
        
        echo "✓ Cleared existing blogs\n";
    }
    
    /**
     * Get blog statistics
     */
    public function getBlogStats() {
        $total = $this->db->query("SELECT COUNT(*) FROM blogs")->fetchColumn();
        $published = $this->db->query("SELECT COUNT(*) FROM blogs WHERE status = 'published'")->fetchColumn();
        $featured = $this->db->query("SELECT COUNT(*) FROM blogs WHERE featured = 1")->fetchColumn();
        
        $categories = $this->db->query("
            SELECT category, COUNT(id) as count 
            FROM blogs 
            GROUP BY category 
            ORDER BY count DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'total' => intval($total),
            'published' => intval($published),
            'featured' => intval($featured),
            'categories' => $categories
        ];
    }
}
