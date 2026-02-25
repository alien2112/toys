<?php

// Test if ProductVariantController can be instantiated
require_once __DIR__ . '/controllers/ProductVariantController.php';

try {
    $controller = new ProductVariantController();
    echo "✅ ProductVariantController instantiated successfully\n";
} catch (Exception $e) {
    echo "❌ ProductVariantController instantiation failed: " . $e->getMessage() . "\n";
    echo "🔍 Error code: " . $e->getCode() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

?>
