<?php

// Test all controller instantiations one by one
$controllers = [
    'AuthController',
    'ProductController',
    'CategoryController',
    'CartController',
    'OrderController',
    'PaymentController',
    'AnalyticsController',
    'WishlistController',
    'InventoryController',
    'SupplierController',
    'SupportController',
    'ChatController',
    'ProductVariantController',
    'ReviewController',
    'BlogController',
    'SettingsController',
    'UploadController',
    'AdminController',
    'AdminSeederController',
    'SwaggerController'
];

foreach ($controllers as $controllerName) {
    $file = __DIR__ . "/controllers/{$controllerName}.php";
    if (!file_exists($file)) {
        echo "❌ File missing: {$controllerName}.php\n";
        continue;
    }

    try {
        require_once $file;
        if (class_exists($controllerName)) {
            $instance = new $controllerName();
            echo "✅ {$controllerName} instantiated successfully\n";
        } else {
            echo "❌ Class {$controllerName} not found in file\n";
        }
    } catch (Exception $e) {
        echo "❌ {$controllerName} failed: " . $e->getMessage() . "\n";
        echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
}

?>
