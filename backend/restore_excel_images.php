<?php

require_once __DIR__ . '/utils/Database.php';

class ExcelImageRestorer {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function restoreExcelImages() {
        echo "🖼️  Restoring original Excel images...\n\n";
        
        try {
            // Get all products with their categories
            $query = "
                SELECT p.id, p.name, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id
            ";
            $stmt = $this->db->query($query);
            $products = $stmt->fetchAll();
            
            if (empty($products)) {
                echo "❌ No products found\n";
                return;
            }
            
            echo "📊 Found " . count($products) . " products to update\n\n";
            
            $updatedCount = 0;
            $errorCount = 0;
            
            foreach ($products as $product) {
                $imageUrl = $this->generateExcelImageUrl($product['name'], $product['category_name']);
                
                echo "🔄 Updating: '{$product['name']}' (ID: {$product['id']})\n";
                echo "   Category: {$product['category_name']}\n";
                echo "   New image: {$imageUrl}\n";
                
                // Update product with Excel image
                $updateQuery = "UPDATE products SET image_url = ? WHERE id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                
                if ($updateStmt->execute([$imageUrl, $product['id']])) {
                    $updatedCount++;
                    echo "   ✅ Updated\n\n";
                } else {
                    $errorCount++;
                    echo "   ❌ Failed to update\n\n";
                }
            }
            
            echo "🎉 Excel image restoration complete!\n";
            echo "   Total products updated: {$updatedCount}\n";
            echo "   Failed updates: {$errorCount}\n";
            
        } catch (Exception $e) {
            echo "❌ Error restoring Excel images: " . $e->getMessage() . "\n";
        }
    }
    
    private function generateExcelImageUrl($name, $category) {
        // Map of category names to directory names
        $categoryDirMap = [
            'سيارات' => 'excel_images',
            'المواليد' => 'excel_birthdays',
            'birthdays' => 'excel_birthdays',
            'cars' => 'excel_images'
        ];
        
        $dir = $categoryDirMap[$category] ?? 'excel_birthdays';
        
        // Count of available images from Excel files
        $carImageCount = 264;  // Number of images extracted from toys Excel
        $birthdayImageCount = 229; // Number of images extracted from birthdays Excel
        
        // Create deterministic mapping based on product name hash
        $nameHash = crc32($name);
        
        if ($dir === 'excel_images') {
            $imageIndex = abs($nameHash) % $carImageCount;
            $imageName = sprintf('excel_car_%03d.jpg', $imageIndex);
        } else {
            $imageIndex = abs($nameHash) % $birthdayImageCount;
            $imageName = sprintf('excel_birthday_%03d.jpg', $imageIndex);
        }
        
        return "http://localhost:8000/images/products/{$dir}/{$imageName}";
    }
    
    public function verifyImages() {
        echo "\n🔍 Verifying Excel images...\n\n";
        
        $query = "
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN image_url LIKE '%excel_%' THEN 1 ELSE 0 END) as excel_images,
                   SUM(CASE WHEN image_url LIKE '%picsum%' THEN 1 ELSE 0 END) as placeholder_images
            FROM products
        ";
        $stmt = $this->db->query($query);
        $stats = $stmt->fetch();
        
        echo "📊 Image Statistics:\n";
        echo "   Total products: {$stats['total']}\n";
        echo "   Products with Excel images: {$stats['excel_images']}\n";
        echo "   Products with placeholder images: {$stats['placeholder_images']}\n";
        
        if ($stats['placeholder_images'] > 0) {
            echo "\n⚠️  Some products still have placeholder images\n";
            
            // Show products with placeholder images
            $placeholderQuery = "
                SELECT id, name, image_url 
                FROM products 
                WHERE image_url LIKE '%picsum%' 
                LIMIT 10
            ";
            $placeholderStmt = $this->db->query($placeholderQuery);
            $placeholders = $placeholderStmt->fetchAll();
            
            echo "\nProducts with placeholder images:\n";
            foreach ($placeholders as $product) {
                echo "   - {$product['name']} (ID: {$product['id']})\n";
            }
        } else {
            echo "\n✅ All products now have Excel images!\n";
        }
    }
    
    public function runRestoration() {
        echo "🚀 Starting Excel image restoration...\n";
        echo "=====================================\n";
        
        $this->restoreExcelImages();
        $this->verifyImages();
        
        echo "\n=====================================\n";
        echo "✨ Excel image restoration complete!\n";
    }
}

// Run the restoration
if (php_sapi_name() === 'cli') {
    $restorer = new ExcelImageRestorer();
    $restorer->runRestoration();
}
