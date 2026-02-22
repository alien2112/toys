<?php

require_once __DIR__ . '/utils/Database.php';

class ExcelDataParser {
    private $seedingDataDir;
    
    public function __construct() {
        $this->seedingDataDir = __DIR__ . '/../seeding-data';
    }
    
    /**
     * Parse CSV file converted from Excel and return data as array
     */
    public function parseExcelFile($filename) {
        $csvFile = $this->getCsvFilename($filename);
        $filePath = $this->seedingDataDir . '/' . $csvFile;
        
        if (!file_exists($filePath)) {
            throw new Exception("CSV file not found: $csvFile");
        }
        
        return $this->parseCsvFile($filePath, $filename);
    }
    
    private function getCsvFilename($excelFilename) {
        if (strpos($excelFilename, 'الالعاب') !== false) {
            return 'toys_data.csv';
        } elseif (strpos($excelFilename, 'المواليد') !== false) {
            return 'birthdays_data.csv';
        }
        return null;
    }
    
    private function parseCsvFile($filePath, $originalFilename) {
        $data = [];
        $headers = [];
        $rowIndex = 0;
        
        if (($handle = fopen($filePath, 'r')) !== FALSE) {
            while (($row = fgetcsv($handle, 1000, ',')) !== FALSE) {
                $rowIndex++;
                
                // Skip header rows and empty rows
                if ($rowIndex <= 4 || empty($row[0]) || empty($row[1])) {
                    if ($rowIndex == 4) {
                        // Extract actual headers from row 4
                        $headers = $this->cleanHeaders($row);
                    }
                    continue;
                }
                
                // Clean and map the row data
                $productData = $this->mapRowToProduct($row, $headers, $originalFilename);
                if ($productData) {
                    $data[] = $productData;
                }
            }
            fclose($handle);
        }
        
        return ['products' => $data];
    }
    
    private function cleanHeaders($headers) {
        $cleaned = [];
        foreach ($headers as $header) {
            $cleaned[] = trim($header);
        }
        return $cleaned;
    }
    
    private function mapRowToProduct($row, $headers, $filename) {
        // Map columns based on position (since headers are Arabic)
        $data = [
            'code' => $row[0] ?? '',
            'name' => $row[1] ?? '',
            'barcode' => $row[2] ?? '',
            'quantity' => $row[3] ?? 0,
            'price' => $row[4] ?? 0,
            'image' => $row[5] ?? ''
        ];
        
        // Skip if no name or code
        if (empty($data['name']) || empty($data['code'])) {
            return null;
        }
        
        // Determine category based on filename
        if (strpos($filename, 'الالعاب') !== false) {
            $category = 'سيارات';
        } elseif (strpos($filename, 'المواليد') !== false) {
            $category = 'المواليد';
        } else {
            $category = 'سيارات'; // fallback
        }
        
        // Convert price to number
        $price = is_numeric($data['price']) ? floatval($data['price']) : 0;
        
        // Generate slug from name
        $slug = $this->generateSlug($data['name']);
        
        // Generate image URL if not provided
        if (empty($data['image'])) {
            $data['image'] = $this->generateImageUrl($data['name'], $category);
        }
        
        // Generate description
        $description = $this->generateDescription($data['name'], $category);
        
        // Determine if featured (random selection for demo)
        $isFeatured = rand(1, 10) <= 2; // 20% chance of being featured
        
        return [
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $description,
            'price' => $price,
            'category' => $category,
            'stock' => intval($data['quantity']) ?: 10,
            'is_featured' => $isFeatured,
            'sku' => $data['code'],
            'barcode' => $data['barcode'],
            'image' => $data['image']
        ];
    }
    
    private function generateSlug($name) {
        // Convert Arabic name to URL-friendly slug
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9\s\-]+/', '', $slug);
        $slug = preg_replace('/\s+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug ?: 'product-' . uniqid();
    }
    
    private function generateImageUrl($name, $category) {
        // Map of category slugs to directory names
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
    
    private function generateDescription($name, $category) {
        $descriptions = [
            'سيارات' => [
                'سيارة لعب عالية الجودة مثالية للأطفال، مصنوعة من مواد آمنة ومتينة.',
                'لعبة سيارة رائعة مع تفاصيل دقيقة وتصميم جذاب للأطفال.',
                'سيارة أطفال ممتازة مع ميزات رائعة وألوان زاهية.',
                'لعبة سيارة كلاسيكية مناسبة لجميع الأعمار.',
                'سيارة لعب متطورة مع وظائف مثيرة ومتعة لا تنتهي.'
            ],
            'المواليد' => [
                'منتج أطفال عالي الجودة مصمم للراحة والأمان للصغار.',
                'منتج ممتاز للمواليد والأطفال مع مواد آمنة وتصميم عملي.',
                'منتج أطفال رائع مع ميزات مريحة وعملية.',
                'منتج عالي الجودة للأطفال مع تصميم عصري وألوان هادئة.',
                'منتج أطفال مثالي مع تركيز على الراحة والسلامة.'
            ]
        ];
        
        $categoryDescriptions = $descriptions[$category] ?? $descriptions['سيارات'];
        return $categoryDescriptions[array_rand($categoryDescriptions)];
    }
}
