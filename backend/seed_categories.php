<?php

require_once __DIR__ . '/models/Category.php';
require_once __DIR__ . '/utils/Database.php';

// Initialize database connection
Database::getInstance()->getConnection();

$category = new Category();

// Categories to seed (matching the Masthead component)
$categoriesToSeed = [
    [
        'name' => 'ألعاب أولاد',
        'slug' => 'boys',
        'description' => 'ألعاب ومعدات خاصة بالأولاد تشمل السيارات والدراجات والألعاب الرياضية'
    ],
    [
        'name' => 'ألعاب مائية',
        'slug' => 'water',
        'description' => 'ألعاب مائية متنوعة للسباحة والمرح في الماء'
    ],
    [
        'name' => 'العاب بنات',
        'slug' => 'girls',
        'description' => 'ألعاب ومعدات خاصة بالبنات تشمل الدمى وألعاب التجميل'
    ],
    [
        'name' => 'العاب بيبي',
        'slug' => 'baby',
        'description' => 'ألعاب آمنة للأطفال الرضع ومعدات العناية بالطفل'
    ],
    [
        'name' => 'بالونات هيليوم',
        'slug' => 'balloons',
        'description' => 'بالونات هيليوم ملونة للاحتفالات والمناسبات السعيدة'
    ],
    [
        'name' => 'تعليمي',
        'slug' => 'edu',
        'description' => 'ألعاب تعليمية لتطوير مهارات الأطفال والتعلم الممتع'
    ],
    [
        'name' => 'دراجات وسيارات',
        'slug' => 'bikes',
        'description' => 'دراجات وسيارات أطفال بأحجام وأشكال متنوعة'
    ],
    [
        'name' => 'سوبر كار',
        'slug' => 'supercar',
        'description' => 'سيارات فاخرة وموديلات سيارات رياضية للأطفال'
    ],
    [
        'name' => 'مسابقات / تحديات',
        'slug' => 'challenges',
        'description' => 'ألعاب المسابقات والتحديات التي تنمي الروح الرياضية'
    ],
    [
        'name' => 'سيارات',
        'slug' => 'cars',
        'description' => 'مجموعة متنوعة من سيارات الألعاب بجميع الأشكال والأحجام'
    ],
    [
        'name' => 'بالونات',
        'slug' => 'balloons-general',
        'description' => 'بالونات ملونة ومناسبة لجميع أنواع الاحتفالات'
    ],
    [
        'name' => 'ديناصورات',
        'slug' => 'dinosaurs',
        'description' => 'ألعاب الديناصورات الواقعية والمثيرة للأطفال'
    ],
    [
        'name' => 'فضاء',
        'slug' => 'space',
        'description' => 'ألعاب الفضاء والصواريخ والمغامرات العلمية'
    ]
];

echo "Starting category seeding...\n";

$successCount = 0;
$skipCount = 0;
$errorCount = 0;

foreach ($categoriesToSeed as $catData) {
    try {
        // Check if category already exists by slug
        $existing = $category->getBySlug($catData['slug']);
        
        if ($existing) {
            echo "⚠️  Category '{$catData['name']}' (slug: {$catData['slug']}) already exists. Skipping.\n";
            $skipCount++;
            continue;
        }
        
        // Create new category
        $result = $category->create($catData['name'], $catData['slug'], $catData['description']);
        
        if ($result) {
            echo "✅ Successfully created category: {$catData['name']}\n";
            $successCount++;
        } else {
            echo "❌ Failed to create category: {$catData['name']}\n";
            $errorCount++;
        }
        
    } catch (Exception $e) {
        echo "❌ Error creating category '{$catData['name']}': " . $e->getMessage() . "\n";
        $errorCount++;
    }
}

echo "\n=== Category Seeding Summary ===\n";
echo "✅ Successfully created: {$successCount} categories\n";
echo "⚠️  Skipped (already exist): {$skipCount} categories\n";
echo "❌ Failed to create: {$errorCount} categories\n";
echo "📊 Total processed: " . ($successCount + $skipCount + $errorCount) . " categories\n";

if ($successCount > 0) {
    echo "\n🎉 Category seeding completed successfully!\n";
} else {
    echo "\nℹ️  No new categories were added (all may already exist).\n";
}

// Display all categories after seeding
echo "\n=== Current Categories in Database ===\n";
$allCategories = $category->getAll();

foreach ($allCategories as $cat) {
    $productCount = $category->getProductCount($cat['id']);
    echo "📂 {$cat['name']} (slug: {$cat['slug']}) - {$productCount} products\n";
}

echo "\nTotal categories: " . count($allCategories) . "\n";
