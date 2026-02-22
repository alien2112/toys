<?php

require_once __DIR__ . '/utils/Database.php';

class ProductCleaner {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function cleanDuplicates() {
        echo "🧹 Starting duplicate product cleanup...\n\n";
        
        try {
            // Find duplicates by name
            $duplicatesQuery = "
                SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
                FROM products 
                GROUP BY name 
                HAVING COUNT(*) > 1
                ORDER BY count DESC
            ";
            
            $stmt = $this->db->query($duplicatesQuery);
            $duplicates = $stmt->fetchAll();
            
            if (empty($duplicates)) {
                echo "✅ No duplicate products found\n";
                return;
            }
            
            $totalRemoved = 0;
            
            foreach ($duplicates as $duplicate) {
                $ids = explode(',', $duplicate['ids']);
                $keepId = array_shift($ids); // Keep the first one
                $removeIds = $ids;
                
                echo "🔄 Processing: '{$duplicate['name']}' ({$duplicate['count']} duplicates)\n";
                echo "   Keeping ID: {$keepId}\n";
                echo "   Removing IDs: " . implode(', ', $removeIds) . "\n";
                
                // Remove duplicates
                $placeholders = str_repeat('?,', count($removeIds) - 1) . '?';
                $deleteQuery = "DELETE FROM products WHERE id IN ($placeholders)";
                $deleteStmt = $this->db->prepare($deleteQuery);
                $deleteStmt->execute($removeIds);
                
                $totalRemoved += count($removeIds);
                echo "   ✅ Removed " . count($removeIds) . " duplicates\n\n";
            }
            
            echo "🎉 Duplicate cleanup complete!\n";
            echo "   Total duplicates removed: {$totalRemoved}\n";
            
        } catch (Exception $e) {
            echo "❌ Error cleaning duplicates: " . $e->getMessage() . "\n";
        }
    }
    
    public function fixMissingImages() {
        echo "\n🖼️  Starting missing image fixes...\n\n";
        
        try {
            // Find products without images
            $missingImagesQuery = "
                SELECT id, name, category_id 
                FROM products 
                WHERE image_url IS NULL OR image_url = ''
                LIMIT 100
            ";
            
            $stmt = $this->db->query($missingImagesQuery);
            $products = $stmt->fetchAll();
            
            if (empty($products)) {
                echo "✅ All products have images\n";
                return;
            }
            
            $fixedCount = 0;
            
            foreach ($products as $product) {
                // Generate placeholder image based on product ID and category
                $categoryName = $this->getCategoryName($product['category_id']);
                $seed = strtolower(str_replace(' ', '_', $product['name'])) . '_' . $product['id'];
                $imageUrl = "https://picsum.photos/seed/{$seed}/400/400.jpg";
                
                echo "🔄 Fixing image for: '{$product['name']}' (ID: {$product['id']})\n";
                echo "   Category: {$categoryName}\n";
                echo "   New image: {$imageUrl}\n";
                
                // Update product with image
                $updateQuery = "UPDATE products SET image_url = ? WHERE id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([$imageUrl, $product['id']]);
                
                $fixedCount++;
                echo "   ✅ Fixed\n\n";
            }
            
            echo "🎉 Image fixing complete!\n";
            echo "   Total images fixed: {$fixedCount}\n";
            
        } catch (Exception $e) {
            echo "❌ Error fixing images: " . $e->getMessage() . "\n";
        }
    }
    
    private function getCategoryName($categoryId) {
        if (!$categoryId) return 'general';
        
        $query = "SELECT name FROM categories WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$categoryId]);
        $result = $stmt->fetch();
        
        return $result ? $result['name'] : 'general';
    }
    
    public function getStats() {
        echo "\n📊 Current Database Stats:\n";
        
        $totalQuery = "SELECT COUNT(*) as total FROM products";
        $stmt = $this->db->query($totalQuery);
        $total = $stmt->fetch()['total'];
        
        $withImagesQuery = "SELECT COUNT(*) as count FROM products WHERE image_url IS NOT NULL AND image_url != ''";
        $stmt = $this->db->query($withImagesQuery);
        $withImages = $stmt->fetch()['count'];
        
        $duplicatesQuery = "
            SELECT COUNT(*) as count FROM (
                SELECT name, COUNT(*) as cnt
                FROM products 
                GROUP BY name 
                HAVING cnt > 1
            ) as duplicates
        ";
        $stmt = $this->db->query($duplicatesQuery);
        $duplicateGroups = $stmt->fetch()['count'];
        
        echo "   Total products: {$total}\n";
        echo "   Products with images: {$withImages}\n";
        echo "   Products without images: " . ($total - $withImages) . "\n";
        echo "   Duplicate product groups: {$duplicateGroups}\n";
    }
    
    public function runFullCleanup() {
        echo "🚀 Starting complete product cleanup...\n";
        echo "=====================================\n";
        
        $this->getStats();
        $this->cleanDuplicates();
        $this->fixMissingImages();
        
        echo "\n=====================================\n";
        echo "📊 Final Stats:\n";
        $this->getStats();
        
        echo "\n✨ Cleanup complete!\n";
    }
}

// Run the cleanup
if (php_sapi_name() === 'cli') {
    $cleaner = new ProductCleaner();
    $cleaner->runFullCleanup();
}
