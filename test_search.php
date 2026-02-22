<?php
// Simple test script to verify search functionality
require_once 'backend/models/Product.php';
require_once 'backend/utils/Database.php';

echo "Testing Product Search Functionality\n";
echo "====================================\n";

try {
    $productModel = new Product();
    
    // Test 1: Basic search
    echo "Test 1: Basic search for 'سيارة'\n";
    $results = $productModel->getAll(null, 5, 0, 'سيارة');
    echo "Found " . count($results) . " results\n";
    foreach ($results as $product) {
        echo "- " . $product['name'] . "\n";
    }
    echo "\n";
    
    // Test 2: Search suggestions
    echo "Test 2: Search suggestions for 'سي'\n";
    $suggestions = $productModel->getSearchSuggestions('سي', 3);
    echo "Found " . count($suggestions) . " suggestions\n";
    foreach ($suggestions as $suggestion) {
        echo "- " . $suggestion['name'] . "\n";
    }
    echo "\n";
    
    // Test 3: Popular searches
    echo "Test 3: Popular searches\n";
    $popular = $productModel->getPopularSearchTerms(5);
    echo "Found " . count($popular) . " popular terms\n";
    foreach ($popular as $term) {
        echo "- " . $term['name'] . " (searched " . $term['search_count'] . " times)\n";
    }
    echo "\n";
    
    // Test 4: Search with sorting
    echo "Test 4: Search with sorting by price\n";
    $sortedResults = $productModel->getAll(null, 3, 0, null, null, null, 'price', 'ASC');
    echo "Products sorted by price (ASC):\n";
    foreach ($sortedResults as $product) {
        echo "- " . $product['name'] . " - " . $product['price'] . " KWD\n";
    }
    echo "\n";
    
    echo "All tests completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
