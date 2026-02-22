<?php

require_once __DIR__ . '/utils/Database.php';
require_once __DIR__ . '/seed_excel_data.php';

class ProductSeeder {
    private $db;
    private $parser;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->parser = new ExcelDataParser();
    }
    
    public function seedProducts() {
        echo "🚀 Starting product seeding...\n\n";
        
        try {
            // Get categories mapping
            $categories = $this->getCategories();
            
            // Get product data from both Excel files
            $toysData = $this->parser->parseExcelFile('الالعاب والدراجات محدث (1).xlsx');
            $birthdaysData = $this->parser->parseExcelFile('المواليد محدث (1).xlsx');
            
            // Merge both datasets
            $allProducts = array_merge(
                $toysData['products'] ?? [],
                $birthdaysData['products'] ?? []
            );
            
            if (empty($allProducts)) {
                echo "❌ No product data found\n";
                return;
            }
            
            echo "📊 Found " . count($allProducts) . " total products\n";
            echo "   - Toys: " . count($toysData['products'] ?? []) . " products\n";
            echo "   - Birthdays: " . count($birthdaysData['products'] ?? []) . " products\n\n";
            
            $insertedCount = 0;
            $updatedCount = 0;
            
            foreach ($allProducts as $product) {
                // Get category ID
                $categoryId = $this->getCategoryId($product['category'], $categories);
                
                if (!$categoryId) {
                    echo "⚠️  Category '{$product['category']}' not found for product: {$product['name']}\n";
                    continue;
                }
                
                // Check if product exists by slug
                $existingProduct = $this->getProductBySlug($product['slug']);
                
                if ($existingProduct) {
                    // Update existing product
                    $this->updateProduct($product, $categoryId);
                    echo "🔄 Updated product: {$product['name']}\n";
                    $updatedCount++;
                } else {
                    // Insert new product
                    $productId = $this->insertProduct($product, $categoryId);
                    echo "✅ Inserted product: {$product['name']} (ID: {$productId})\n";
                    $insertedCount++;
                }
            }
            
            echo "\n📊 Product Seeding Summary:\n";
            echo "   ✅ Inserted: {$insertedCount} new products\n";
            echo "   🔄 Updated: {$updatedCount} existing products\n";
            echo "   📦 Total processed: " . ($insertedCount + $updatedCount) . " products\n";
            
        } catch (Exception $e) {
            echo "❌ Error seeding products: " . $e->getMessage() . "\n";
        }
    }
    
    private function getCategories() {
        $stmt = $this->db->query("SELECT id, name FROM categories");
        $categories = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categories[$row['name']] = $row['id'];
        }
        
        // Add "المواليد" category if it doesn't exist
        if (!isset($categories['المواليد'])) {
            $this->addCategory('المواليد', 'birthdays', 'منتجات المواليد والأطفال');
            // Re-fetch categories
            $stmt = $this->db->query("SELECT id, name FROM categories");
            $categories = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $categories[$row['name']] = $row['id'];
            }
        }
        
        return $categories;
    }
    
    private function addCategory($name, $slug, $description) {
        echo "📂 Adding category: {$name}\n";
        $stmt = $this->db->prepare("
            INSERT INTO categories (name, slug, description, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([$name, $slug, $description]);
        echo "✅ Category '{$name}' added\n";
    }
    
    private function getCategoryId($categoryName, $categories) {
        return isset($categories[$categoryName]) ? $categories[$categoryName] : null;
    }
    
    private function getProductBySlug($slug) {
        $stmt = $this->db->prepare("SELECT id FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function insertProduct($product, $categoryId) {
        $stmt = $this->db->prepare("
            INSERT INTO products (
                name, slug, description, price, category_id, 
                stock, is_featured, is_active, image_url, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, NOW(), NOW())
        ");
        
        $stmt->execute([
            $product['name'],
            $product['slug'],
            $product['description'],
            $product['price'],
            $categoryId,
            $product['stock'],
            !empty($product['is_featured']) ? 1 : 0,
            $product['image'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }
    
    private function updateProduct($product, $categoryId) {
        $stmt = $this->db->prepare("
            UPDATE products SET 
                name = ?, description = ?, price = ?, category_id = ?,
                stock = ?, is_featured = ?, image_url = ?, updated_at = NOW()
            WHERE slug = ?
        ");
        
        return $stmt->execute([
            $product['name'],
            $product['description'],
            $product['price'],
            $categoryId,
            $product['stock'],
            !empty($product['is_featured']) ? 1 : 0,
            $product['image'] ?? null,
            $product['slug']
        ]);
    }
    
    public function clearAllProducts() {
        echo "🗑️  Clearing all products...\n";
        
        // Clear order items first (foreign key constraint)
        $this->db->exec("DELETE FROM order_items");
        
        // Clear cart items
        $this->db->exec("DELETE FROM cart");
        
        // Clear reviews
        $this->db->exec("DELETE FROM reviews");
        
        // Clear product images
        $this->db->exec("DELETE FROM product_images");
        
        // Clear products
        $result = $this->db->exec("DELETE FROM products");
        
        echo "✅ Cleared {$result} products\n";
    }
}

// Run the seeder if called directly
if (php_sapi_name() === 'cli' && basename(__FILE__) === 'seed_products.php') {
    $seeder = new ProductSeeder();
    
    if (isset($argv[1]) && $argv[1] === '--clear') {
        $seeder->clearAllProducts();
    }
    
    $seeder->seedProducts();
}
