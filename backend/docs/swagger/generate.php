<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../docs/swagger/swagger.php';

// Include all controllers to load their annotations
$controllers = [
    __DIR__ . '/../controllers/AuthController.php',
    __DIR__ . '/../controllers/ProductController.php',
    __DIR__ . '/../controllers/CartController.php',
    __DIR__ . '/../controllers/OrderController.php',
    __DIR__ . '/../controllers/ReviewController.php',
    __DIR__ . '/../controllers/UploadController.php',
    __DIR__ . '/../controllers/AdminController.php',
    __DIR__ . '/../controllers/SettingsController.php',
    __DIR__ . '/../controllers/CategoryController.php',
    __DIR__ . '/../controllers/BlogController.php',
    __DIR__ . '/../controllers/PaymentController.php',
    __DIR__ . '/../controllers/AnalyticsController.php',
    __DIR__ . '/../controllers/WishlistController.php',
    __DIR__ . '/../controllers/InventoryController.php',
    __DIR__ . '/../controllers/SupplierController.php',
    __DIR__ . '/../controllers/SupportController.php',
    __DIR__ . '/../controllers/ChatController.php',
    __DIR__ . '/../controllers/ProductVariantController.php',
];

foreach ($controllers as $controller) {
    if (file_exists($controller)) {
        require_once $controller;
    }
}

$openapi = \OpenApi\Generator::scan([__DIR__ . '/../docs/swagger']);

header('Content-Type: application/json');
echo $openapi->toJson();
