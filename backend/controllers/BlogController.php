<?php

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class BlogController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get all blogs with pagination and filtering
     */
    public function getBlogs($page = 1, $limit = 10, $category = null, $search = null, $status = 'published') {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT b.*, c.name as category_name, c.color as category_color 
                FROM blogs b 
                LEFT JOIN blog_categories c ON b.category = c.slug 
                WHERE b.status = :status";
        
        $params = ['status' => $status];
        
        if ($category && $category !== 'all') {
            $sql .= " AND b.category = :category";
            $params['category'] = $category;
        }
        
        if ($search) {
            $sql .= " AND (b.title LIKE :search OR b.summary LIKE :search OR b.content LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }
        
        $sql .= " ORDER BY b.published_at DESC, b.created_at DESC LIMIT :limit OFFSET :offset";
        
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $blogs = $this->db->query($sql, $params)->fetchAll(PDO::FETCH_ASSOC);
        
        // Get tags for each blog
        foreach ($blogs as &$blog) {
            $blog['tags'] = $this->getBlogTags($blog['id']);
            $blog['author_social'] = json_decode($blog['author_social'] ?? '[]', true);
        }
        
        return $blogs;
    }
    
    /**
     * Get blog by ID
     */
    public function getBlogById($id) {
        $sql = "SELECT b.*, c.name as category_name, c.color as category_color 
                FROM blogs b 
                LEFT JOIN blog_categories c ON b.category = c.slug 
                WHERE b.id = :id AND b.status = 'published'";
        
        $blog = $this->db->query($sql, ['id' => $id])->fetch(PDO::FETCH_ASSOC);
        
        if ($blog) {
            $blog['tags'] = $this->getBlogTags($blog['id']);
            $blog['author_social'] = json_decode($blog['author_social'] ?? '[]', true);
            
            // Increment views
            $this->incrementViews($id);
        }
        
        return $blog;
    }
    
    /**
     * Get blog by slug
     */
    public function getBlogBySlug($slug) {
        $sql = "SELECT b.*, c.name as category_name, c.color as category_color 
                FROM blogs b 
                LEFT JOIN blog_categories c ON b.category = c.slug 
                WHERE b.slug = :slug AND b.status = 'published'";
        
        $blog = $this->db->query($sql, ['slug' => $slug])->fetch(PDO::FETCH_ASSOC);
        
        if ($blog) {
            $blog['tags'] = $this->getBlogTags($blog['id']);
            $blog['author_social'] = json_decode($blog['author_social'] ?? '[]', true);
            
            // Increment views
            $this->incrementViews($blog['id']);
        }
        
        return $blog;
    }
    
    /**
     * Get featured blogs
     */
    public function getFeaturedBlogs($limit = 3) {
        $sql = "SELECT b.*, c.name as category_name, c.color as category_color 
                FROM blogs b 
                LEFT JOIN blog_categories c ON b.category = c.slug 
                WHERE b.status = 'published' AND b.featured = 1 
                ORDER BY b.published_at DESC 
                LIMIT :limit";
        
        $blogs = $this->db->query($sql, ['limit' => $limit])->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($blogs as &$blog) {
            $blog['tags'] = $this->getBlogTags($blog['id']);
            $blog['author_social'] = json_decode($blog['author_social'] ?? '[]', true);
        }
        
        return $blogs;
    }
    
    /**
     * Get trending blogs (by views)
     */
    public function getTrendingBlogs($limit = 5) {
        $sql = "SELECT b.*, c.name as category_name, c.color as category_color 
                FROM blogs b 
                LEFT JOIN blog_categories c ON b.category = c.slug 
                WHERE b.status = 'published' 
                ORDER BY b.views DESC, b.published_at DESC 
                LIMIT :limit";
        
        $blogs = $this->db->query($sql, ['limit' => $limit])->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($blogs as &$blog) {
            $blog['tags'] = $this->getBlogTags($blog['id']);
            $blog['author_social'] = json_decode($blog['author_social'] ?? '[]', true);
        }
        
        return $blogs;
    }
    
    /**
     * Get related blogs
     */
    public function getRelatedBlogs($blogId, $limit = 3) {
        $blog = $this->getBlogById($blogId);
        if (!$blog) return [];
        
        $sql = "SELECT b.*, c.name as category_name, c.color as category_color 
                FROM blogs b 
                LEFT JOIN blog_categories c ON b.category = c.slug 
                WHERE b.status = 'published' AND b.id != :blogId 
                AND (b.category = :category OR b.author_name = :author_name)
                ORDER BY 
                    CASE WHEN b.category = :category THEN 1 ELSE 2 END,
                    b.published_at DESC 
                LIMIT :limit";
        
        $blogs = $this->db->query($sql, [
            'blogId' => $blogId,
            'category' => $blog['category'],
            'author_name' => $blog['author_name'],
            'limit' => $limit
        ])->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($blogs as &$blog) {
            $blog['tags'] = $this->getBlogTags($blog['id']);
            $blog['author_social'] = json_decode($blog['author_social'] ?? '[]', true);
        }
        
        return $blogs;
    }
    
    /**
     * Create new blog
     */
    public function createBlog($data) {
        $sql = "INSERT INTO blogs (
            title, slug, summary, content, category, author_name, author_avatar, 
            author_bio, author_credentials, author_social, featured, status, 
            image_url, tags, meta_title, meta_description, read_time, published_at
        ) VALUES (
            :title, :slug, :summary, :content, :category, :author_name, :author_avatar,
            :author_bio, :author_credentials, :author_social, :featured, :status,
            :image_url, :tags, :meta_title, :meta_description, :read_time, :published_at
        )";
        
        $params = [
            'title' => $data['title'],
            'slug' => $this->generateSlug($data['title']),
            'summary' => $data['summary'],
            'content' => $data['content'],
            'category' => $data['category'],
            'author_name' => $data['author_name'],
            'author_avatar' => $data['author_avatar'] ?? null,
            'author_bio' => $data['author_bio'] ?? null,
            'author_credentials' => $data['author_credentials'] ?? null,
            'author_social' => json_encode($data['author_social'] ?? []),
            'featured' => $data['featured'] ?? 0,
            'status' => $data['status'] ?? 'draft',
            'image_url' => $data['image_url'] ?? null,
            'tags' => json_encode($data['tags'] ?? []),
            'meta_title' => $data['meta_title'] ?? $data['title'],
            'meta_description' => $data['meta_description'] ?? $data['summary'],
            'read_time' => $this->calculateReadTime($data['content']),
            'published_at' => ($data['status'] === 'published') ? date('Y-m-d H:i:s') : null
        ];
        
        $this->db->query($sql, $params);
        $blogId = $this->db->lastInsertId();
        
        // Handle tags
        if (!empty($data['tags'])) {
            $this->updateBlogTags($blogId, $data['tags']);
        }
        
        return $blogId;
    }
    
    /**
     * Update blog
     */
    public function updateBlog($id, $data) {
        $sql = "UPDATE blogs SET 
            title = :title, 
            summary = :summary, 
            content = :content, 
            category = :category, 
            author_name = :author_name,
            author_avatar = :author_avatar,
            author_bio = :author_bio,
            author_credentials = :author_credentials,
            author_social = :author_social,
            featured = :featured,
            status = :status,
            image_url = :image_url,
            tags = :tags,
            meta_title = :meta_title,
            meta_description = :meta_description,
            read_time = :read_time,
            updated_at = CURRENT_TIMESTAMP";
        
        // Update slug if title changed
        if (isset($data['title']) && $data['title']) {
            $sql .= ", slug = :slug";
        }
        
        // Update published_at if status changed to published
        if (isset($data['status']) && $data['status'] === 'published') {
            $sql .= ", published_at = CASE WHEN published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END";
        }
        
        $sql .= " WHERE id = :id";
        
        $params = [
            'id' => $id,
            'title' => $data['title'],
            'summary' => $data['summary'],
            'content' => $data['content'],
            'category' => $data['category'],
            'author_name' => $data['author_name'],
            'author_avatar' => $data['author_avatar'] ?? null,
            'author_bio' => $data['author_bio'] ?? null,
            'author_credentials' => $data['author_credentials'] ?? null,
            'author_social' => json_encode($data['author_social'] ?? []),
            'featured' => $data['featured'] ?? 0,
            'status' => $data['status'],
            'image_url' => $data['image_url'] ?? null,
            'tags' => json_encode($data['tags'] ?? []),
            'meta_title' => $data['meta_title'] ?? $data['title'],
            'meta_description' => $data['meta_description'] ?? $data['summary'],
            'read_time' => $this->calculateReadTime($data['content'])
        ];
        
        if (isset($data['title']) && $data['title']) {
            $params['slug'] = $this->generateSlug($data['title'], $id);
        }
        
        $this->db->query($sql, $params);
        
        // Handle tags
        if (isset($data['tags'])) {
            $this->updateBlogTags($id, $data['tags']);
        }
        
        return true;
    }
    
    /**
     * Toggle featured status of a blog (max 3 featured blogs)
     */
    public function toggleFeatured($id) {
        $user = AuthMiddleware::requireAdmin();
        
        // Check if blog exists
        $blog = $this->db->query("SELECT featured FROM blogs WHERE id = :id", ['id' => $id])->fetch(PDO::FETCH_ASSOC);
        
        if (!$blog) {
            Response::error('Blog not found', 404);
            return;
        }
        
        // If trying to feature this blog, check the limit
        if ($blog['featured'] == 0) {
            $featuredCount = $this->db->query("SELECT COUNT(*) as count FROM blogs WHERE featured = 1 AND status = 'published'")->fetch()['count'];
            
            if ($featuredCount >= 3) {
                Response::error('Cannot feature more than 3 blogs. Unfeature an existing blog first.', 400);
                return;
            }
        }
        
        // Toggle featured status
        $newFeaturedStatus = $blog['featured'] == 0 ? 1 : 0;
        $this->db->query("UPDATE blogs SET featured = :featured WHERE id = :id", [
            'featured' => $newFeaturedStatus,
            'id' => $id
        ]);
        
        $message = $newFeaturedStatus == 1 ? 'Blog featured successfully' : 'Blog unfeatured successfully';
        Response::success(['featured' => $newFeaturedStatus], $message);
    }
    
    /**
     * Delete blog
     */
    public function deleteBlog($id) {
        $user = AuthMiddleware::requireAdmin();
        
        // Delete tag relations first
        $this->db->query("DELETE FROM blog_tag_relations WHERE blog_id = :id", ['id' => $id]);
        
        // Delete blog
        $this->db->query("DELETE FROM blogs WHERE id = :id", ['id' => $id]);
        
        Response::success(null, 'Blog deleted successfully');
    }
    
    /**
     * Get all categories
     */
    public function getCategories() {
        $sql = "SELECT * FROM blog_categories ORDER BY name";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get all tags
     */
    public function getTags() {
        $sql = "SELECT * FROM blog_tags ORDER BY name";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get blogs for admin (including drafts)
     */
    public function getBlogsForAdmin($page = 1, $limit = 10, $search = null, $status = null) {
        $user = AuthMiddleware::requireAdmin();
        
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT b.*, c.name as category_name 
                FROM blogs b 
                LEFT JOIN blog_categories c ON b.category = c.slug 
                WHERE 1=1";
        
        $params = [];
        
        if ($status && $status !== 'all') {
            $sql .= " AND b.status = :status";
            $params['status'] = $status;
        }
        
        if ($search) {
            $sql .= " AND (b.title LIKE :search OR b.summary LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }
        
        $sql .= " ORDER BY b.created_at DESC LIMIT :limit OFFSET :offset";
        
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $blogs = $this->db->query($sql, $params)->fetchAll(PDO::FETCH_ASSOC);
        
        Response::success(['blogs' => $blogs]);
    }
    
    /**
     * Get total blogs count for admin
     */
    public function getBlogsCount($search = null, $status = null) {
        $user = AuthMiddleware::requireAdmin();
        
        $sql = "SELECT COUNT(*) as count FROM blogs WHERE 1=1";
        $params = [];
        
        if ($status && $status !== 'all') {
            $sql .= " AND status = :status";
            $params['status'] = $status;
        }
        
        if ($search) {
            $sql .= " AND (title LIKE :search OR summary LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }
        
        $result = $this->db->query($sql, $params)->fetch(PDO::FETCH_ASSOC);
        Response::success(['count' => intval($result['count'])]);
    }
    
    // Private methods
    
    private function getBlogTags($blogId) {
        $sql = "SELECT t.name, t.slug 
                FROM blog_tags t 
                JOIN blog_tag_relations btr ON t.id = btr.tag_id 
                WHERE btr.blog_id = :blogId 
                ORDER BY t.name";
        
        return $this->db->query($sql, ['blogId' => $blogId])->fetchAll(PDO::FETCH_COLUMN);
    }
    
    private function updateBlogTags($blogId, $tags) {
        // Delete existing tag relations
        $this->db->query("DELETE FROM blog_tag_relations WHERE blog_id = :blogId", ['blogId' => $blogId]);
        
        // Add new tag relations
        foreach ($tags as $tagName) {
            // Get or create tag
            $tag = $this->db->query("SELECT id FROM blog_tags WHERE name = :name", ['name' => $tagName])->fetch(PDO::FETCH_ASSOC);
            
            if (!$tag) {
                $slug = $this->generateSlug($tagName);
                $this->db->query("INSERT INTO blog_tags (name, slug) VALUES (:name, :slug)", ['name' => $tagName, 'slug' => $slug]);
                $tagId = $this->db->lastInsertId();
            } else {
                $tagId = $tag['id'];
            }
            
            // Add relation
            $this->db->query("INSERT INTO blog_tag_relations (blog_id, tag_id) VALUES (:blogId, :tagId)", [
                'blogId' => $blogId,
                'tagId' => $tagId
            ]);
        }
    }
    
    private function generateSlug($title, $excludeId = null) {
        $slug = strtolower($title);
        $slug = preg_replace('/[^a-z0-9\u0600-\u06FF\s-]/u', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // Check if slug exists
        $sql = "SELECT id FROM blogs WHERE slug = :slug";
        $params = ['slug' => $slug];
        
        if ($excludeId) {
            $sql .= " AND id != :excludeId";
            $params['excludeId'] = $excludeId;
        }
        
        $existing = $this->db->query($sql, $params)->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            $slug .= '-' . time();
        }
        
        return $slug;
    }
    
    private function calculateReadTime($content) {
        $wordCount = str_word_count(strip_tags($content));
        $wordsPerMinute = 200; // Average reading speed
        $minutes = ceil($wordCount / $wordsPerMinute);
        return $minutes . ' دقائق';
    }
    
    private function incrementViews($blogId) {
        $this->db->query("UPDATE blogs SET views = views + 1 WHERE id = :id", ['id' => $blogId]);
    }
}
