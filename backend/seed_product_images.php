<?php

require_once __DIR__ . '/utils/Database.php';
require_once __DIR__ . '/models/Product.php';

class ProductImageSeeder {
    private $db;
    private $productModel;
    private $baseUrl = 'https://picsum.photos/seed/';
    private $imageDir;
    private $publicDir;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->productModel = new Product();
        $this->publicDir = __DIR__ . '/public';
        $this->imageDir = $this->publicDir . '/images/products';
        
        // Create directories if they don't exist
        $this->createDirectories();
    }

    private function createDirectories() {
        if (!file_exists($this->imageDir)) {
            mkdir($this->imageDir, 0755, true);
        }
    }

    private function downloadImage($url, $filename) {
        $filePath = $this->imageDir . '/' . $filename;
        
        // Check if file already exists
        if (file_exists($filePath)) {
            return $filePath;
        }

        // Download the image using file_get_contents
        $imageData = @file_get_contents($url);
        
        if ($imageData === false) {
            echo "Failed to download: $filename\n";
            return false;
        }

        // Save the image
        if (file_put_contents($filePath, $imageData)) {
            echo "Downloaded: $filename\n";
            return $filePath;
        } else {
            echo "Failed to save: $filename\n";
            return false;
        }
    }

    private function getProductImages() {
        return [
            // Race Cars
            [
                'name' => 'سيارة سباق كهربائية',
                'slug' => 'electric-racing-car',
                'images' => [
                    ['seed' => 'racecar001-main', 'alt' => 'سيارة سباق كهربائية - الواجهة الأمامية'],
                    ['seed' => 'racecar001-side', 'alt' => 'سيارة سباق كهربائية - الجانب'],
                    ['seed' => 'racecar001-back', 'alt' => 'سيارة سباق كهربائية - الخلف'],
                    ['seed' => 'racecar001-detail', 'alt' => 'سيارة سباق كهربائية - تفاصيل'],
                    ['seed' => 'racecar001-wheel', 'alt' => 'سيارة سباق كهربائية - العجلات'],
                    ['seed' => 'racecar001-interior', 'alt' => 'سيارة سباق كهربائية - الداخل'],
                    ['seed' => 'racecar001-top', 'alt' => 'سيارة سباق كهربائية - الأعلى'],
                    ['seed' => 'racecar001-action', 'alt' => 'سيارة سباق كهربائية - أثناء الحركة']
                ]
            ],
            [
                'name' => 'سيارة رياضية حمراء',
                'slug' => 'red-sports-car',
                'images' => [
                    ['seed' => 'sportscar005-main', 'alt' => 'سيارة رياضية حمراء - الواجهة الأمامية'],
                    ['seed' => 'sportscar005-side', 'alt' => 'سيارة رياضية حمراء - الجانب'],
                    ['seed' => 'sportscar005-back', 'alt' => 'سيارة رياضية حمراء - الخلف'],
                    ['seed' => 'sportscar005-detail', 'alt' => 'سيارة رياضية حمراء - تفاصيل'],
                    ['seed' => 'sportscar005-wheel', 'alt' => 'سيارة رياضية حمراء - العجلات'],
                    ['seed' => 'sportscar005-interior', 'alt' => 'سيارة رياضية حمراء - الداخل']
                ]
            ],
            [
                'name' => 'سيارة شرطة',
                'slug' => 'police-car',
                'images' => [
                    ['seed' => 'police009-main', 'alt' => 'سيارة شرطة - الواجهة الأمامية'],
                    ['seed' => 'police009-side', 'alt' => 'سيارة شرطة - الجانب'],
                    ['seed' => 'police009-lights', 'alt' => 'سيارة شرطة - الأضواء'],
                    ['seed' => 'police009-detail', 'alt' => 'سيارة شرطة - تفاصيل'],
                    ['seed' => 'police009-siren', 'alt' => 'سيارة شرطة - صفارة الإنذار'],
                    ['seed' => 'police009-interior', 'alt' => 'سيارة شرطة - الداخل'],
                    ['seed' => 'police009-back', 'alt' => 'سيارة شرطة - الخلف'],
                    ['seed' => 'police009-action', 'alt' => 'سيارة شرطة - أثناء الحركة']
                ]
            ],
            
            // Dinosaurs
            [
                'name' => 'ديناصور تيريكس',
                'slug' => 'ديناصور-تيريكس',
                'images' => [
                    ['seed' => 'dino003-main', 'alt' => 'ديناصور تيريكس - الواجهة الأمامية'],
                    ['seed' => 'dino003-side', 'alt' => 'ديناصور تيريكس - الجانب'],
                    ['seed' => 'dino003-roar', 'alt' => 'ديناصور تيريكس - صرخة'],
                    ['seed' => 'dino003-detail', 'alt' => 'ديناصور تيريكس - تفاصيل'],
                    ['seed' => 'dino003-teeth', 'alt' => 'ديناصور تيريكس - الأسنان'],
                    ['seed' => 'dino003-tail', 'alt' => 'ديناصور تيريكس - الذيل'],
                    ['seed' => 'dino003-head', 'alt' => 'ديناصور تيريكس - الرأس'],
                    ['seed' => 'dino003-action', 'alt' => 'ديناصور تيريكس - أثناء الحركة']
                ]
            ],
            [
                'name' => 'ديناصور فيلوسيرابتور',
                'slug' => 'velociraptor-dinosaur',
                'images' => [
                    ['seed' => 'veloci007-main', 'alt' => 'ديناصور فيلوسيرابتور - الواجهة الأمامية'],
                    ['seed' => 'veloci007-side', 'alt' => 'ديناصور فيلوسيرابتور - الجانب'],
                    ['seed' => 'veloci007-run', 'alt' => 'ديناصور فيلوسيرابتور - ركض'],
                    ['seed' => 'veloci007-detail', 'alt' => 'ديناصور فيلوسيرابتور - تفاصيل'],
                    ['seed' => 'veloci007-claw', 'alt' => 'ديناصور فيلوسيرابتور - المخلب'],
                    ['seed' => 'veloci007-head', 'alt' => 'ديناصور فيلوسيرابتور - الرأس'],
                    ['seed' => 'veloci007-action', 'alt' => 'ديناصور فيلوسيرابتور - أثناء الحركة'],
                    ['seed' => 'veloci007-skeleton', 'alt' => 'ديناصور فيلوسيرابتور - هيكل عظمي']
                ]
            ],
            [
                'name' => 'ديناصور ترايسيراتوبس',
                'slug' => 'triceratops-dinosaur',
                'images' => [
                    ['seed' => 'trice011-main', 'alt' => 'ديناصور ترايسيراتوبس - الواجهة الأمامية'],
                    ['seed' => 'trice011-side', 'alt' => 'ديناصور ترايسيراتوبس - الجانب'],
                    ['seed' => 'trice011-horns', 'alt' => 'ديناصور ترايسيراتوبس - القرون'],
                    ['seed' => 'trice011-detail', 'alt' => 'ديناصور ترايسيراتوبس - تفاصيل'],
                    ['seed' => 'trice011-head', 'alt' => 'ديناصور ترايسيراتوبس - الرأس'],
                    ['seed' => 'trice011-back', 'alt' => 'ديناصور ترايسيراتوبس - الخلف'],
                    ['seed' => 'trice011-action', 'alt' => 'ديناصور ترايسيراتوبس - أثناء الحركة']
                ]
            ],
            [
                'name' => 'ديناصور ترايسيراتوبس',
                'slug' => '-',
                'images' => [
                    ['seed' => 'trice011-main', 'alt' => 'ديناصور ترايسيراتوبس - الواجهة الأمامية'],
                    ['seed' => 'trice011-side', 'alt' => 'ديناصور ترايسيراتوبس - الجانب'],
                    ['seed' => 'trice011-horns', 'alt' => 'ديناصور ترايسيراتوبس - القرون'],
                    ['seed' => 'trice011-detail', 'alt' => 'ديناصور ترايسيراتوبس - تفاصيل'],
                    ['seed' => 'trice011-head', 'alt' => 'ديناصور ترايسيراتوبس - الرأس'],
                    ['seed' => 'trice011-back', 'alt' => 'ديناصور ترايسيراتوبس - الخلف'],
                    ['seed' => 'trice011-action', 'alt' => 'ديناصور ترايسيراتوبس - أثناء الحركة']
                ]
            ],
            
            // Space Toys
            [
                'name' => 'سفينة فضاء صاروخية',
                'slug' => 'rocket-spaceship',
                'images' => [
                    ['seed' => 'space004-main', 'alt' => 'سفينة فضاء صاروخية - الواجهة الأمامية'],
                    ['seed' => 'space004-side', 'alt' => 'سفينة فضاء صاروخية - الجانب'],
                    ['seed' => 'space004-cockpit', 'alt' => 'سفينة فضاء صاروخية - قمرة القيادة'],
                    ['seed' => 'space004-engine', 'alt' => 'سفينة فضاء صاروخية - المحرك'],
                    ['seed' => 'space004-detail', 'alt' => 'سفينة فضاء صاروخية - تفاصيل'],
                    ['seed' => 'space004-wing', 'alt' => 'سفينة فضاء صاروخية - الجناح'],
                    ['seed' => 'space004-bottom', 'alt' => 'سفينة فضاء صاروخية - الأسفل'],
                    ['seed' => 'space004-action', 'alt' => 'سفينة فضاء صاروخية - أثناء الحركة']
                ]
            ],
            [
                'name' => 'محطة فضاء دولية',
                'slug' => '--',
                'images' => [
                    ['seed' => 'station008-main', 'alt' => 'محطة فضاء دولية - الواجهة الأمامية'],
                    ['seed' => 'station008-side', 'alt' => 'محطة فضاء دولية - الجانب'],
                    ['seed' => 'station008-interior', 'alt' => 'محطة فضاء دولية - الداخل'],
                    ['seed' => 'station008-detail', 'alt' => 'محطة فضاء دولية - تفاصيل'],
                    ['seed' => 'station008-astronaut', 'alt' => 'محطة فضاء دولية - رائد الفضاء'],
                    ['seed' => 'station008-equipment', 'alt' => 'محطة فضاء دولية - المعدات'],
                    ['seed' => 'station008-panels', 'alt' => 'محطة فضاء دولية - الألواح الشمسية'],
                    ['seed' => 'station008-action', 'alt' => 'محطة فضاء دولية - أثناء العمل']
                ]
            ],
            [
                'name' => 'مكوك فضائي',
                'slug' => 'space-shuttle',
                'images' => [
                    ['seed' => 'shuttle012-main', 'alt' => 'مكوك فضائي - الواجهة الأمامية'],
                    ['seed' => 'shuttle012-side', 'alt' => 'مكوك فضائي - الجانب'],
                    ['seed' => 'shuttle012-launch', 'alt' => 'مكوك فضائي - الإطلاق'],
                    ['seed' => 'shuttle012-detail', 'alt' => 'مكوك فضائي - تفاصيل'],
                    ['seed' => 'shuttle012-platform', 'alt' => 'مكوك فضائي - منصة الإطلاق'],
                    ['seed' => 'shuttle012-astronaut', 'alt' => 'مكوك فضائي - رائد الفضاء'],
                    ['seed' => 'shuttle012-engine', 'alt' => 'مكوك فضائي - المحرك'],
                    ['seed' => 'shuttle012-action', 'alt' => 'مكوك فضائي - أثناء الحركة']
                ]
            ],
            
            // Balloons
            [
                'name' => 'بالون حرف K',
                'slug' => 'balloon-k',
                'images' => [
                    ['seed' => 'balloon002-main', 'alt' => 'بالون حرف K - الواجهة الأمامية'],
                    ['seed' => 'balloon002-side', 'alt' => 'بالون حرف K - الجانب'],
                    ['seed' => 'balloon002-detail', 'alt' => 'بالون حرف K - تفاصيل'],
                    ['seed' => 'balloon002-gloss', 'alt' => 'بالون حرف K - لمعان'],
                    ['seed' => 'balloon002-string', 'alt' => 'بالون حرف K - الخيط'],
                    ['seed' => 'balloon002-color', 'alt' => 'بالون حرف K - الألوان']
                ]
            ],
            [
                'name' => 'مجموعة بالونات ملونة',
                'slug' => 'colorful-balloons-set',
                'images' => [
                    ['seed' => 'balloons006-main', 'alt' => 'مجموعة بالونات ملونة - الواجهة الأمامية'],
                    ['seed' => 'balloons006-mixed', 'alt' => 'مجموعة بالونات ملونة - متنوعة'],
                    ['seed' => 'balloons006-colors', 'alt' => 'مجموعة بالونات ملونة - الألوان'],
                    ['seed' => 'balloons006-detail', 'alt' => 'مجموعة بالونات ملونة - تفاصيل'],
                    ['seed' => 'balloons006-group', 'alt' => 'مجموعة بالونات ملونة - المجموعة'],
                    ['seed' => 'balloons006-single', 'alt' => 'مجموعة بالونات ملونة - بالون واحد'],
                    ['seed' => 'balloons006-pack', 'alt' => 'مجموعة بالونات ملونة - العبوة']
                ]
            ],
            [
                'name' => 'بالون قلب أحمر',
                'slug' => 'red-heart-balloon',
                'images' => [
                    ['seed' => 'heart010-main', 'alt' => 'بالون قلب أحمر - الواجهة الأمامية'],
                    ['seed' => 'heart010-side', 'alt' => 'بالون قلب أحمر - الجانب'],
                    ['seed' => 'heart010-detail', 'alt' => 'بالون قلب أحمر - تفاصيل'],
                    ['seed' => 'heart010-gloss', 'alt' => 'بالون قلب أحمر - لمعان'],
                    ['seed' => 'heart010-string', 'alt' => 'بالون قلب أحمر - الخيط'],
                    ['seed' => 'heart010-romantic', 'alt' => 'بالون قلب أحمر - رومانسي']
                ]
            ],
            [
                'name' => 'فثسف',
                'slug' => 'فثسف',
                'images' => [
                    ['seed' => 'misc001-main', 'alt' => 'منتج متنوع - الواجهة الأمامية'],
                    ['seed' => 'misc001-side', 'alt' => 'منتج متنوع - الجانب'],
                    ['seed' => 'misc001-detail', 'alt' => 'منتج متنوع - تفاصيل'],
                    ['seed' => 'misc001-action', 'alt' => 'منتج متنوع - أثناء الاستخدام']
                ]
            ]
        ];
    }

    public function seedImages() {
        echo "Starting product image seeding...\n\n";

        // First, run the migration
        $this->runMigration();

        // Get all products from database
        $products = $this->getAllProducts();
        
        // Get product images data
        $productImages = $this->getProductImages();

        foreach ($products as $product) {
            echo "Processing product: {$product['name']} (ID: {$product['id']})\n";
            
            // Find matching product images data
            $imagesData = $this->findProductImages($product['slug'], $productImages);
            
            if (!$imagesData) {
                echo "  No image data found for this product\n\n";
                continue;
            }

            // Clear existing images for this product
            $this->clearProductImages($product['id']);

            // Download and save images
            foreach ($imagesData['images'] as $index => $imageData) {
                $imageUrl = $this->baseUrl . $imageData['seed'] . '/400/400.jpg';
                $filename = $imageData['seed'] . '.jpg';
                $relativePath = '/images/products/' . $filename;
                
                // Download image
                $localPath = $this->downloadImage($imageUrl, $filename);
                
                if ($localPath) {
                    // Save to database
                    $this->saveProductImage(
                        $product['id'],
                        $relativePath,
                        $localPath,
                        $imageData['alt'],
                        $index
                    );
                    
                    echo "  ✓ Saved image: {$filename}\n";
                }
            }
            
            echo "  Completed product: {$product['name']}\n\n";
        }

        echo "Image seeding completed!\n";
        echo "Images saved to: " . $this->imageDir . "\n";
        echo "Web accessible path: /images/products/\n";
    }

    private function runMigration() {
        echo "Running migration...\n";
        $migrationFile = __DIR__ . '/database/migrations/002_add_product_images.sql';
        
        if (file_exists($migrationFile)) {
            $sql = file_get_contents($migrationFile);
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    try {
                        $this->db->exec($statement);
                    } catch (PDOException $e) {
                        // Table might already exist, continue
                        echo "Migration note: " . $e->getMessage() . "\n";
                    }
                }
            }
            echo "Migration completed.\n\n";
        }
    }

    private function getAllProducts() {
        $stmt = $this->db->query("SELECT id, name, slug FROM products");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function findProductImages($slug, $productImages) {
        foreach ($productImages as $product) {
            if ($product['slug'] === $slug) {
                return $product;
            }
        }
        return null;
    }

    private function clearProductImages($productId) {
        $stmt = $this->db->prepare("DELETE FROM product_images WHERE product_id = ?");
        $stmt->execute([$productId]);
    }

    private function saveProductImage($productId, $imageUrl, $imagePath, $altText, $sortOrder) {
        $stmt = $this->db->prepare(
            "INSERT INTO product_images (product_id, image_url, image_path, alt_text, sort_order) 
             VALUES (?, ?, ?, ?, ?)"
        );
        
        return $stmt->execute([$productId, $imageUrl, $imagePath, $altText, $sortOrder]);
    }
}

// Run the seeder if called directly
if (php_sapi_name() === 'cli' && basename(__FILE__) === 'seed_product_images.php') {
    $seeder = new ProductImageSeeder();
    $seeder->seedImages();
}
