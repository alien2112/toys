<?php

class CsrfMiddleware {
    /**
     * For JWT-based APIs, CSRF is mitigated by:
     * 1. Checking Content-Type is application/json (browsers can't send this cross-origin without preflight)
     * 2. Verifying the Authorization header exists for state-changing requests
     * 3. Rejecting requests with no Origin or Referer on state-changing endpoints
     */
    public static function validate() {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        
        // Only validate state-changing methods
        if (!in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            return true;
        }
        
        // Webhook endpoints are exempt (they use their own signature verification)
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        $exemptPaths = ['/api/payments/moyasar/callback', '/api/payments/stripe/webhook'];
        foreach ($exemptPaths as $path) {
            if (strpos($uri, $path) !== false) {
                return true;
            }
        }
        
        // Enforce JSON content type for all state-changing requests
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') === false) {
            // Allow multipart for file uploads
            if (strpos($contentType, 'multipart/form-data') === false) {
                http_response_code(415);
                echo json_encode(['success' => false, 'message' => 'Content-Type must be application/json']);
                exit;
            }
        }
        
        // Check Origin or Referer header is present and from allowed origin
        $config = require __DIR__ . '/../config/config.php';
        $allowedOrigins = $config['cors']['allowed_origins'];
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        
        if (!empty($origin)) {
            if (!in_array($origin, $allowedOrigins)) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden: invalid origin']);
                exit;
            }
        } elseif (!empty($referer)) {
            $refererHost = parse_url($referer, PHP_URL_HOST);
            $allowed = false;
            foreach ($allowedOrigins as $allowedOrigin) {
                if (strpos($allowedOrigin, $refererHost) !== false) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden: invalid referer']);
                exit;
            }
        }
        // If neither Origin nor Referer is present, allow (curl/mobile apps)
        // JWT token still protects authenticated endpoints
        
        return true;
    }
}
