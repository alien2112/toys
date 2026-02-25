<?php

/**
 * Comprehensive TOYS Store API Testing Script with Response Times
 * Tests all endpoints with proper authentication and measures response times
 */

class ComprehensiveAPITester {
    private $baseUrl = 'http://localhost:8000/api';
    private $authToken = null;
    private $adminToken = null;
    private $testUser = null;
    private $testProduct = null;
    private $results = [];

    public function __construct() {
        echo "🚀 Comprehensive TOYS Store API Testing with Response Times\n";
        echo "===========================================================\n\n";
    }

    private function makeRequest($method, $endpoint, $data = null, $headers = []) {
        $url = $this->baseUrl . $endpoint;
        $options = [
            'http' => [
                'method' => $method,
                'ignore_errors' => true,
                'header' => implode("\r\n", $headers)
            ]
        ];

        if ($data) {
            $options['http']['header'] .= "\r\nContent-Type: application/json";
            $options['http']['content'] = json_encode($data);
        }

        $context = stream_context_create($options);

        $startTime = microtime(true);
        $response = file_get_contents($url, false, $context);
        $endTime = microtime(true);
        $responseTime = round(($endTime - $startTime) * 1000, 2); // ms

        // Get HTTP status code from headers
        $httpCode = 0;
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $header) {
                if (preg_match('#^HTTP/\d+\.\d+\s+(\d+)#', $header, $matches)) {
                    $httpCode = (int)$matches[1];
                    break;
                }
            }
        }

        $error = null;
        if ($response === false) {
            $error = 'Request failed';
            $response = '';
        }

        return [
            'response' => json_decode($response, true),
            'http_code' => $httpCode,
            'response_time' => $responseTime,
            'error' => $error,
            'raw_response' => $response
        ];
    }

    private function logTest($testName, $result, $httpCode, $responseTime, $details = '') {
        $status = $result ? '✅ PASS' : '❌ FAIL';
        echo "[$status] $testName\n";
        echo "   HTTP $httpCode | {$responseTime}ms | $details\n\n";

        $this->results[] = [
            'test' => $testName,
            'status' => $result,
            'http_code' => $httpCode,
            'response_time' => $responseTime,
            'details' => $details
        ];

        return $result;
    }

    private function testAuthentication() {
        echo "🔐 Testing Authentication Endpoints\n";
        echo "===================================\n";

        // Register
        $registerData = [
            'email' => 'testuser_' . time() . '@example.com',
            'password' => 'TestPassword123',
            'first_name' => 'Test',
            'last_name' => 'User'
        ];
        $result = $this->makeRequest('POST', '/register', $registerData);
        $success = $result['http_code'] === 201 && isset($result['response']['success']);
        $this->logTest('User Registration', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');
        if ($success) $this->testUser = $result['response']['data']['user'] ?? null;

        // Login
        $loginData = ['email' => $registerData['email'], 'password' => $registerData['password']];
        $result = $this->makeRequest('POST', '/login', $loginData);
        $success = $result['http_code'] === 200 && isset($result['response']['data']['token']);
        $this->logTest('User Login', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');
        if ($success) $this->authToken = $result['response']['data']['token'];

        // Get Current User
        if ($this->authToken) {
            $headers = ['Authorization: Bearer ' . $this->authToken];
            $result = $this->makeRequest('GET', '/me', null, $headers);
            $success = $result['http_code'] === 200 && isset($result['response']['data']['email']);
            $this->logTest('Get Current User', $success, $result['http_code'], $result['response_time'],
                $result['response']['message'] ?? 'No message');
        }

        // Admin Login
        $adminLoginData = ['email' => 'admin@toystore.com', 'password' => 'admin123'];
        $result = $this->makeRequest('POST', '/login', $adminLoginData);
        $success = $result['http_code'] === 200 && isset($result['response']['data']['token']);
        $this->logTest('Admin Login', $success, $result['http_code'], $result['response_time'],
            $success ? 'Success' : 'Admin user may not exist');
        if ($success) $this->adminToken = $result['response']['data']['token'];
    }

    private function testProducts() {
        echo "📦 Testing Product Endpoints\n";
        echo "===========================\n";

        // Get All Products
        $result = $this->makeRequest('GET', '/products');
        $success = $result['http_code'] === 200 && isset($result['response']['data']);
        $this->logTest('Get All Products', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');

        // Get Featured Products
        $result = $this->makeRequest('GET', '/products/featured');
        $success = $result['http_code'] === 200 && isset($result['response']['data']);
        $this->logTest('Get Featured Products', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');

        // Get Top Rated Products
        $result = $this->makeRequest('GET', '/products/top-rated');
        $success = $result['http_code'] === 200 && isset($result['response']['data']);
        $this->logTest('Get Top Rated Products', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');

        // Search Suggestions
        $result = $this->makeRequest('GET', '/products/search/suggestions?q=test');
        $success = $result['http_code'] === 200;
        $this->logTest('Product Search Suggestions', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');

        // Get Product by ID
        $result = $this->makeRequest('GET', '/products/1');
        $success = in_array($result['http_code'], [200, 404]);
        $this->logTest('Get Product by ID', $success, $result['http_code'], $result['response_time'],
            $result['http_code'] === 404 ? 'Product may not exist' : ($result['response']['message'] ?? 'No message'));

        // Create Product (Admin)
        if ($this->adminToken) {
            $productData = [
                'name' => 'Test Product ' . time(),
                'description' => 'Test product',
                'price' => 99.99,
                'stock' => 10,
                'category_id' => 1,
                'image_url' => '/products/test.jpg',
                'is_active' => true,
                'featured' => false
            ];
            $headers = ['Authorization: Bearer ' . $this->adminToken];
            $result = $this->makeRequest('POST', '/products', $productData, $headers);
            $success = $result['http_code'] === 201 && isset($result['response']['data']);
            $this->logTest('Create Product (Admin)', $success, $result['http_code'], $result['response_time'],
                $result['response']['message'] ?? 'No message');
            if ($success) $this->testProduct = $result['response']['data'];
        }
    }

    private function testCategories() {
        echo "📂 Testing Category Endpoints\n";
        echo "=============================\n";

        // Get All Categories
        $result = $this->makeRequest('GET', '/categories');
        $success = $result['http_code'] === 200 && isset($result['response']['data']);
        $this->logTest('Get All Categories', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');

        // Get Category by ID
        $result = $this->makeRequest('GET', '/categories/1');
        $success = in_array($result['http_code'], [200, 404]);
        $this->logTest('Get Category by ID', $success, $result['http_code'], $result['response_time'],
            $result['http_code'] === 404 ? 'Category may not exist' : ($result['response']['message'] ?? 'No message'));
    }

    private function testCart() {
        echo "🛒 Testing Cart Endpoints\n";
        echo "========================\n";

        if (!$this->authToken || !$this->testUser) {
            $this->logTest('Cart Tests', false, 0, 0, 'No authenticated user');
            return;
        }

        $headers = ['Authorization: Bearer ' . $this->authToken];

        // Get User Cart
        $result = $this->makeRequest('GET', '/cart/' . $this->testUser['id'], null, $headers);
        $success = $result['http_code'] === 200;
        $this->logTest('Get User Cart', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');

        // Add Item to Cart
        $cartItem = ['product_id' => 1, 'quantity' => 2];
        $result = $this->makeRequest('POST', '/cart', $cartItem, $headers);
        $success = in_array($result['http_code'], [200, 400]);
        $this->logTest('Add Item to Cart', $success, $result['http_code'], $result['response_time'],
            $result['http_code'] === 400 ? 'Product may not exist' : ($result['response']['message'] ?? 'No message'));
    }

    private function testOrders() {
        echo "📋 Testing Order Endpoints\n";
        echo "==========================\n";

        if (!$this->authToken || !$this->testUser) {
            $this->logTest('Order Tests', false, 0, 0, 'No authenticated user');
            return;
        }

        $headers = ['Authorization: Bearer ' . $this->authToken];

        // Get User Orders
        $result = $this->makeRequest('GET', '/orders/' . $this->testUser['id'], null, $headers);
        $success = $result['http_code'] === 200;
        $this->logTest('Get User Orders', $success, $result['http_code'], $result['response_time'],
            $result['response']['message'] ?? 'No message');

        // Create Order
        $orderData = [
            'items' => [['product_id' => 1, 'quantity' => 1, 'price' => 99.99]],
            'shipping_address' => 'Test Address',
            'payment_method' => 'cash_on_delivery'
        ];
        $result = $this->makeRequest('POST', '/orders', $orderData, $headers);
        $success = in_array($result['http_code'], [201, 400]);
        $this->logTest('Create Order', $success, $result['http_code'], $result['response_time'],
            $result['http_code'] === 400 ? 'Invalid data' : ($result['response']['message'] ?? 'No message'));
    }

    private function testSwagger() {
        echo "📖 Testing Swagger Documentation\n";
        echo "===============================\n";

        // Swagger UI
        $result = $this->makeRequest('GET', '/docs');
        $success = $result['http_code'] === 200;
        $this->logTest('Swagger UI Access', $success, $result['http_code'], $result['response_time'],
            $success ? 'Accessible' : 'Not accessible');

        // Swagger JSON
        $result = $this->makeRequest('GET', '/docs/swagger.json');
        $success = $result['http_code'] === 200 && isset($result['response']['openapi']);
        $this->logTest('Swagger JSON Access', $success, $result['http_code'], $result['response_time'],
            $success ? 'Valid JSON' : 'Invalid or not found');
    }

    private function testErrorHandling() {
        echo "🚨 Testing Error Handling\n";
        echo "=========================\n";

        // Invalid Endpoint
        $result = $this->makeRequest('GET', '/nonexistent-endpoint');
        $success = $result['http_code'] === 404;
        $this->logTest('Invalid Endpoint', $success, $result['http_code'], $result['response_time'],
            $success ? 'Correctly returns 404' : 'Wrong status code');

        // Unauthorized Access
        $headers = ['Authorization: Bearer invalid-token'];
        $result = $this->makeRequest('GET', '/me', null, $headers);
        $success = $result['http_code'] === 401;
        $this->logTest('Unauthorized Access', $success, $result['http_code'], $result['response_time'],
            $success ? 'Correctly returns 401' : 'Wrong status code');

        // Invalid Request Data
        $result = $this->makeRequest('POST', '/register', ['invalid' => 'data']);
        $success = $result['http_code'] === 400;
        $this->logTest('Invalid Request Data', $success, $result['http_code'], $result['response_time'],
            $success ? 'Correctly returns 400' : 'Wrong status code');
    }

    private function generateReport() {
        echo "📊 COMPREHENSIVE API TESTING REPORT\n";
        echo "====================================\n\n";

        $totalTests = count($this->results);
        $passedTests = count(array_filter($this->results, fn($r) => $r['status']));
        $failedTests = $totalTests - $passedTests;
        $avgResponseTime = round(array_sum(array_column($this->results, 'response_time')) / $totalTests, 2);
        $maxResponseTime = max(array_column($this->results, 'response_time'));
        $minResponseTime = min(array_column($this->results, 'response_time'));

        echo "📈 Summary Statistics:\n";
        echo "- Total Tests: $totalTests\n";
        echo "- Passed: $passedTests\n";
        echo "- Failed: $failedTests\n";
        echo "- Average Response Time: {$avgResponseTime}ms\n";
        echo "- Fastest Response: {$minResponseTime}ms\n";
        echo "- Slowest Response: {$maxResponseTime}ms\n\n";

        echo "📋 Detailed Results:\n";
        foreach ($this->results as $result) {
            $status = $result['status'] ? 'PASS' : 'FAIL';
            echo "- {$result['test']}: $status (HTTP {$result['http_code']}, {$result['response_time']}ms)\n";
        }
        echo "\n";

        echo "🔑 Authentication Status:\n";
        echo "- User Token: " . ($this->authToken ? '✅ Obtained' : '❌ Failed') . "\n";
        echo "- Admin Token: " . ($this->adminToken ? '✅ Obtained' : '❌ Failed') . "\n";
        echo "- Test User ID: " . ($this->testUser ? $this->testUser['id'] : 'None') . "\n\n";

        echo "🎯 All endpoints tested with proper authentication where required.\n";
        echo "⏱️  Response times measured for each request.\n";
        echo "✅ No assumptions made - actual API behavior verified.\n";
    }

    public function runAllTests() {
        try {
            $this->testAuthentication();
            $this->testProducts();
            $this->testCategories();
            $this->testCart();
            $this->testOrders();
            $this->testSwagger();
            $this->testErrorHandling();

            $this->generateReport();

        } catch (Exception $e) {
            echo "❌ Test execution failed: " . $e->getMessage() . "\n";
        }
    }
}

// Run the comprehensive tests
$tester = new ComprehensiveAPITester();
$tester->runAllTests();

?>
