<?php

// Test calling specific controller methods
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/CategoryController.php';
require_once __DIR__ . '/controllers/SettingsController.php';

$controllers = [
    ['class' => 'ProductController', 'method' => 'getFeatured', 'args' => [10]],
    ['class' => 'CategoryController', 'method' => 'getAll', 'args' => []],
    ['class' => 'SettingsController', 'method' => 'getSettings', 'args' => []]
];

foreach ($controllers as $test) {
    $className = $test['class'];
    $methodName = $test['method'];
    $args = $test['args'];

    try {
        $controller = new $className();
        echo "Testing {$className}->{$methodName}()\n";

        $result = call_user_func_array([$controller, $methodName], $args);
        echo "✅ {$className}->{$methodName}() executed successfully\n";

    } catch (Exception $e) {
        echo "❌ {$className}->{$methodName}() failed: " . $e->getMessage() . "\n";
        echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
}

?>
