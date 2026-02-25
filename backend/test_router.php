<?php

// Test the router dispatch process
require_once __DIR__ . '/routes/api.php';

$router = require __DIR__ . '/routes/api.php';

echo "Testing router dispatch...\n";

// Test a simple route
try {
    // Simulate a GET request to /categories
    $method = 'GET';
    $uri = '/api/categories';

    echo "Dispatching: $method $uri\n";
    ob_start(); // Capture output
    $router->dispatch($method, $uri);
    $output = ob_get_clean();

    echo "✅ Router dispatch completed\n";
    echo "Output length: " . strlen($output) . " characters\n";
    if (strlen($output) > 0) {
        echo "Output preview: " . substr($output, 0, 200) . "\n";
    }

} catch (Exception $e) {
    echo "❌ Router dispatch failed: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

?>
