<?php

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// CORS headers
$config = require __DIR__ . '/../config/config.php';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (!empty($origin) && in_array($origin, $config['cors']['allowed_origins'])) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
} else {
    // Reject unknown origins — do not send CORS headers
    // Browser will block the request automatically
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(403);
        exit;
    }
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Create logs directory if it doesn't exist
if (!is_dir(__DIR__ . '/../logs')) { mkdir(__DIR__ . '/../logs', 0755, true); }

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("Error: [$errno] $errstr in $errfile on line $errline");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    exit;
});

set_exception_handler(function($exception) {
    error_log("Exception: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    exit;
});

require_once __DIR__ . '/../middleware/CsrfMiddleware.php';
CsrfMiddleware::validate();

$router = require __DIR__ . '/../routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

$router->dispatch($method, $uri);
