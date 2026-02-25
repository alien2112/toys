<?php

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../seed_products.php';
require_once __DIR__ . '/../seed_users.php';
require_once __DIR__ . '/../seed_product_images.php';
require_once __DIR__ . '/../seed_blogs.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminSeederController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Get seeder status and statistics
     */
    public function getStatus() {
        $user = AuthMiddleware::requireAdmin();
        
        $stats = [
            'products' => $this->getProductStats(),
            'users' => $this->getUserStats(),
            'categories' => $this->getCategoryStats(),
            'blogs' => $this->getBlogStats(),
            'excel_files' => $this->getExcelFileStatus()
        ];
        
        Response::success($stats);
    }
    
    /**
     * Preview Excel data before seeding
     */
    public function previewData() {
        $user = AuthMiddleware::requireAdmin();
        
        try {
            require_once __DIR__ . '/../seed_excel_data.php';
            $parser = new ExcelDataParser();
            
            $toysData = $parser->parseExcelFile('الالعاب والدراجات محدث (1).xlsx');
            $birthdaysData = $parser->parseExcelFile('المواليد محدث (1).xlsx');
            
            $preview = [
                'toys' => [
                    'count' => count($toysData['products'] ?? []),
                    'sample' => array_slice($toysData['products'] ?? [], 0, 5)
                ],
                'birthdays' => [
                    'count' => count($birthdaysData['products'] ?? []),
                    'sample' => array_slice($birthdaysData['products'] ?? [], 0, 5)
                ]
            ];
            
            Response::success($preview);
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    /**
     * Seed products from Excel files
     */
    public function seedProducts() {
        $user = AuthMiddleware::requireAdmin();
        
        try {
            $mode = $_POST['mode'] ?? 'merge';
            
            if (!in_array($mode, ['merge', 'replace'])) {
                throw new Exception('Invalid mode. Use merge or replace.');
            }
            
            $productSeeder = new ProductSeeder();
            
            if ($mode === 'replace') {
                $productSeeder->clearAllProducts();
            }
            
            // Capture output for progress tracking
            ob_start();
            $productSeeder->seedProducts();
            $output = ob_get_clean();
            
            $stats = $this->getProductStats();
            
            Response::success([
                'stats' => $stats,
                'output' => $output
            ], "Products seeded successfully in {$mode} mode");
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    /**
     * Seed users from Excel files
     */
    public function seedUsers() {
        $user = AuthMiddleware::requireAdmin();
        
        try {
            $mode = $_POST['mode'] ?? 'merge';
            
            if (!in_array($mode, ['merge', 'replace'])) {
                throw new Exception('Invalid mode. Use merge or replace.');
            }
            
            $userSeeder = new UserSeeder();
            
            if ($mode === 'replace') {
                $userSeeder->clearAllUsers();
            }
            
            // Capture output for progress tracking
            ob_start();
            $userSeeder->seedUsers();
            $output = ob_get_clean();
            
            $stats = $this->getUserStats();
            
            Response::success([
                'stats' => $stats,
                'output' => $output
            ], "Users seeded successfully in {$mode} mode");
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    /**
     * Seed product images
     */
    public function seedImages() {
        $user = AuthMiddleware::requireAdmin();
        
        try {
            // Capture output for progress tracking
            ob_start();
            $imageSeeder = new ProductImageSeeder();
            $imageSeeder->seedImages();
            $output = ob_get_clean();
            
            Response::success([
                'output' => $output
            ], 'Product images seeded successfully');
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    /**
     * Seed blogs
     */
    public function seedBlogs() {
        $user = AuthMiddleware::requireAdmin();
        
        try {
            $mode = $_POST['mode'] ?? 'merge';
            
            if (!in_array($mode, ['merge', 'replace'])) {
                throw new Exception('Invalid mode. Use merge or replace.');
            }
            
            $blogSeeder = new BlogSeeder();
            
            if ($mode === 'replace') {
                $blogSeeder->clearBlogs();
            }
            
            // Capture output for progress tracking
            ob_start();
            $count = $blogSeeder->seedBlogs();
            $output = ob_get_clean();
            
            $stats = $this->getBlogStats();
            
            Response::success([
                'stats' => $stats,
                'count' => $count,
                'output' => $output
            ], "Blogs seeded successfully in {$mode} mode");
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    /**
     * Full seeding with all data
     */
    public function seedAll() {
        $user = AuthMiddleware::requireAdmin();
        
        try {
            $mode = $_POST['mode'] ?? 'merge';
            $includeImages = isset($_POST['include_images']) && $_POST['include_images'] === 'true';
            $includeOrders = isset($_POST['include_orders']) && $_POST['include_orders'] === 'true';
            $includeBlogs = isset($_POST['include_blogs']) && $_POST['include_blogs'] === 'true';
            
            if (!in_array($mode, ['merge', 'replace'])) {
                throw new Exception('Invalid mode. Use merge or replace.');
            }
            
            $results = [];
            $totalOutput = [];
            
            // Seed products
            ob_start();
            $productSeeder = new ProductSeeder();
            if ($mode === 'replace') {
                $productSeeder->clearAllProducts();
            }
            $productSeeder->seedProducts();
            $productOutput = ob_get_clean();
            $totalOutput[] = "=== PRODUCTS ===\n" . $productOutput;
            $results['products'] = $this->getProductStats();
            
            // Seed users
            ob_start();
            $userSeeder = new UserSeeder();
            if ($mode === 'replace') {
                $userSeeder->clearAllUsers();
            }
            $userSeeder->seedUsers();
            
            if ($includeOrders) {
                $userSeeder->createSampleOrders();
            }
            $userOutput = ob_get_clean();
            $totalOutput[] = "=== USERS ===\n" . $userOutput;
            $results['users'] = $this->getUserStats();
            
            // Seed images if requested
            if ($includeImages) {
                ob_start();
                $imageSeeder = new ProductImageSeeder();
                $imageSeeder->seedImages();
                $imageOutput = ob_get_clean();
                $totalOutput[] = "=== IMAGES ===\n" . $imageOutput;
                $results['images'] = ['status' => 'completed'];
            }
            
            // Seed blogs if requested
            if ($includeBlogs) {
                ob_start();
                $blogSeeder = new BlogSeeder();
                if ($mode === 'replace') {
                    $blogSeeder->clearBlogs();
                }
                $blogCount = $blogSeeder->seedBlogs();
                $blogOutput = ob_get_clean();
                $totalOutput[] = "=== BLOGS ===\n" . $blogOutput;
                $results['blogs'] = $this->getBlogStats();
            }
            
            Response::success([
                'results' => $results,
                'output' => implode("\n\n", $totalOutput)
            ], "All data seeded successfully in {$mode} mode");
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get product statistics
     */
    private function getProductStats() {
        $total = $this->db->query("SELECT COUNT(*) FROM products")->fetchColumn();
        $featured = $this->db->query("SELECT COUNT(*) FROM products WHERE is_featured = 1")->fetchColumn();
        $stockValue = $this->db->query("SELECT SUM(stock * price) FROM products")->fetchColumn();
        
        $categories = $this->db->query("
            SELECT c.name, COUNT(p.id) as count 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.category_id 
            GROUP BY c.id, c.name 
            ORDER BY count DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'total' => intval($total),
            'featured' => intval($featured),
            'stock_value' => floatval($stockValue),
            'categories' => $categories
        ];
    }
    
    /**
     * Get user statistics
     */
    private function getUserStats() {
        $total = $this->db->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();
        $admins = $this->db->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
        
        return [
            'total' => intval($total),
            'admins' => intval($admins)
        ];
    }
    
    /**
     * Get category statistics
     */
    private function getCategoryStats() {
        $total = $this->db->query("SELECT COUNT(*) FROM categories")->fetchColumn();
        
        return [
            'total' => intval($total)
        ];
    }
    
    /**
     * Get blog statistics
     */
    private function getBlogStats() {
        $blogSeeder = new BlogSeeder();
        return $blogSeeder->getBlogStats();
    }
    
    /**
     * Check Excel file status
     */
    private function getExcelFileStatus() {
        $seedingDataDir = __DIR__ . '/../../seeding-data';
        $files = [
            'toys' => 'الالعاب والدراجات محدث (1).xlsx',
            'birthdays' => 'المواليد محدث (1).xlsx'
        ];
        
        $status = [];
        foreach ($files as $key => $filename) {
            $filePath = $seedingDataDir . '/' . $filename;
            $status[$key] = [
                'exists' => file_exists($filePath),
                'size' => file_exists($filePath) ? filesize($filePath) : 0,
                'modified' => file_exists($filePath) ? filemtime($filePath) : null
            ];
        }
        
        return $status;
    }
}
