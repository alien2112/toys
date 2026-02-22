<?php

require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::error('Unauthorized', 401);
        }

        $token = $matches[1];
        $payload = JWT::decode($token);

        if (!$payload) {
            Response::error('Invalid or expired token', 401);
        }

        return $payload;
    }

    public static function requireAdmin() {
        $user = self::authenticate();
        
        if (!isset($user['role']) || $user['role'] !== 'admin') {
            error_log('Admin access denied for user: ' . json_encode($user));
            Response::error('Admin access required', 403);
        }

        return $user;
    }
}
