<?php

return [
    'db' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => getenv('DB_PORT') ?: '3306',
        'database' => getenv('DB_NAME') ?: 'ecommerce_db',
        'username' => getenv('DB_USER') ?: 'ecommerce_user',
        'password' => getenv('DB_PASS') ?: 'ecommerce_pass',
        'charset' => 'utf8mb4'
    ],
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production',
        'expiration' => 86400
    ],
    'cors' => [
        'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:43373', 'http://localhost:5175', 'http://127.0.0.1:41689'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With']
    ]
];
