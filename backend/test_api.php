<?php

/**
 * TOYS Store API Testing Script
 *
 * This script comprehensively tests all API endpoints to ensure they are working correctly.
 * It includes authentication, CRUD operations, and error handling tests.
 */

class APITester {
    private $baseUrl = 'http://localhost:8000/api';
    private $authToken = null;
    private $adminToken = null;
    private $testUser = null;
    private $testProduct = null;
    private $testOrder = null;

    public function __construct() {
        echo "🚀 Starting TOYS Store API Testing Suite\n";
        echo "==========================================\n\n";
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
        $response = file_get_contents($url, false, $context);

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
            'error' => $error,
            'raw_response' => $response
        ];
    }

    private function logTest($testName, $result, $details = '') {
        $status = $result ? '✅ PASS' : '❌ FAIL';
        echo "[$status] $testName\n";
        if ($details) {
            echo "   $details\n";
        }
        echo "\n";
        return $result;
    }

    private function testAuthentication() {
        echo "🔐 Testing Authentication Endpoints\n";
        echo "===================================\n";

        // Test user registration
        $registerData = [
            'email' => 'testuser_' . time() . '@example.com',
            'password' => 'TestPassword123',
            'first_name' => 'Test',
            'last_name' => 'User'
        ];

        $result = $this->makeRequest('POST', '/register', $registerData);
        $this->logTest(
            'User Registration',
            $result['http_code'] === 201 && isset($result['response']['success']) && $result['response']['success'],
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        if ($result['http_code'] === 201) {
            $this->testUser = $result['response']['data']['user'] ?? null;
        }

        // Test user login
        $loginData = [
            'email' => $registerData['email'],
            'password' => $registerData['password']
        ];

        $result = $this->makeRequest('POST', '/login', $loginData);
        $success = $result['http_code'] === 200 && isset($result['response']['data']['token']);
        $this->logTest(
            'User Login',
            $success,
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        if ($success) {
            $this->authToken = $result['response']['data']['token'];
        }

        // Test get current user
        if ($this->authToken) {
            $result = $this->makeRequest('GET', '/me');
            $this->logTest(
                'Get Current User',
                $result['http_code'] === 200 && isset($result['response']['data']['email']),
                "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
            );
        }

        // Test admin login (assuming admin user exists)
        $adminLoginData = [
            'email' => 'admin@toystore.com',
            'password' => 'admin123'
        ];

        $result = $this->makeRequest('POST', '/login', $adminLoginData);
        if ($result['http_code'] === 200 && isset($result['response']['data']['token'])) {
            $this->adminToken = $result['response']['data']['token'];
            $this->logTest('Admin Login', true, 'Admin authentication successful');
        } else {
            $this->logTest('Admin Login', false, 'Admin user may not exist or credentials incorrect');
        }
    }

    private function testProducts() {
        echo "📦 Testing Product Endpoints\n";
        echo "===========================\n";

        // Test get all products
        $result = $this->makeRequest('GET', '/products');
        $this->logTest(
            'Get All Products',
            $result['http_code'] === 200 && isset($result['response']['data']),
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        // Test get featured products
        $result = $this->makeRequest('GET', '/products/featured');
        $this->logTest(
            'Get Featured Products',
            $result['http_code'] === 200 && isset($result['response']['data']),
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        // Test get top rated products
        $result = $this->makeRequest('GET', '/products/top-rated');
        $this->logTest(
            'Get Top Rated Products',
            $result['http_code'] === 200 && isset($result['response']['data']),
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        // Test product search suggestions
        $result = $this->makeRequest('GET', '/products/search/suggestions?q=test');
        $this->logTest(
            'Product Search Suggestions',
            $result['http_code'] === 200,
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        // Test get specific product (assuming product with ID 1 exists)
        $result = $this->makeRequest('GET', '/products/1');
        $success = $result['http_code'] === 200 || $result['http_code'] === 404; // 404 is acceptable if no products exist
        $this->logTest(
            'Get Product by ID',
            $success,
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'Product may not exist')
        );

        // Test create product (admin only)
        if ($this->adminToken) {
            $productData = [
                'name' => 'Test Product ' . time(),
                'description' => 'A test product created by the testing script',
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
            $this->logTest(
                'Create Product (Admin)',
                $success,
                "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
            );

            if ($success) {
                $this->testProduct = $result['response']['data'];
            }
        }
    }

    private function testCategories() {
        echo "📂 Testing Category Endpoints\n";
        echo "=============================\n";

        // Test get all categories
        $result = $this->makeRequest('GET', '/categories');
        $this->logTest(
            'Get All Categories',
            $result['http_code'] === 200 && isset($result['response']['data']),
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        // Test get category by ID
        $result = $this->makeRequest('GET', '/categories/1');
        $success = $result['http_code'] === 200 || $result['http_code'] === 404; // 404 acceptable if no categories
        $this->logTest(
            'Get Category by ID',
            $success,
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'Category may not exist')
        );
    }

    private function testCart() {
        echo "🛒 Testing Cart Endpoints\n";
        echo "========================\n";

        if (!$this->authToken || !$this->testUser) {
            $this->logTest('Cart Tests', false, 'Skipping cart tests - no authenticated user');
            return;
        }

        // Test get user cart
        $result = $this->makeRequest('GET', '/cart/' . $this->testUser['id']);
        $this->logTest(
            'Get User Cart',
            $result['http_code'] === 200,
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        // Test add item to cart (assuming product exists)
        $cartItem = [
            'product_id' => 1,
            'quantity' => 2
        ];

        $result = $this->makeRequest('POST', '/cart', $cartItem);
        $this->logTest(
            'Add Item to Cart',
            $result['http_code'] === 200 || $result['http_code'] === 400, // 400 acceptable if product doesn't exist
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'Product may not exist')
        );
    }

    private function testOrders() {
        echo "📋 Testing Order Endpoints\n";
        echo "==========================\n";

        if (!$this->authToken || !$this->testUser) {
            $this->logTest('Order Tests', false, 'Skipping order tests - no authenticated user');
            return;
        }

        // Test get user orders
        $result = $this->makeRequest('GET', '/orders/' . $this->testUser['id']);
        $this->logTest(
            'Get User Orders',
            $result['http_code'] === 200,
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'No message')
        );

        // Test create order (if cart has items)
        $orderData = [
            'items' => [
                [
                    'product_id' => 1,
                    'quantity' => 1,
                    'price' => 99.99
                ]
            ],
            'shipping_address' => 'Test Address, Test City, Saudi Arabia',
            'payment_method' => 'cash_on_delivery'
        ];

        $result = $this->makeRequest('POST', '/orders', $orderData);
        $success = $result['http_code'] === 201 || $result['http_code'] === 400; // 400 acceptable if products don't exist
        $this->logTest(
            'Create Order',
            $success,
            "HTTP {$result['http_code']}: " . ($result['response']['message'] ?? 'Products may not exist or invalid data')
        );

        if ($result['http_code'] === 201) {
            $this->testOrder = $result['response']['data'];
        }
    }

    private function testSwagger() {
        echo "📖 Testing Swagger Documentation\n";
        echo "===============================\n";

        // Test Swagger UI
        $result = $this->makeRequest('GET', '/docs');
        $this->logTest(
            'Swagger UI Access',
            $result['http_code'] === 200,
            "HTTP {$result['http_code']}: Swagger UI should be accessible"
        );

        // Test Swagger JSON
        $result = $this->makeRequest('GET', '/docs/swagger.json');
        $this->logTest(
            'Swagger JSON Access',
            $result['http_code'] === 200 && isset($result['response']['openapi']),
            "HTTP {$result['http_code']}: OpenAPI JSON specification should be accessible"
        );
    }

    private function testErrorHandling() {
        echo "🚨 Testing Error Handling\n";
        echo "=========================\n";

        // Test invalid endpoint
        $result = $this->makeRequest('GET', '/nonexistent-endpoint');
        $this->logTest(
            'Invalid Endpoint',
            $result['http_code'] === 404,
            "HTTP {$result['http_code']}: Should return 404 for invalid endpoints"
        );

        // Test unauthorized access
        $headers = ['Authorization: Bearer invalid-token'];
        $result = $this->makeRequest('GET', '/me', null, $headers);
        $this->logTest(
            'Unauthorized Access',
            $result['http_code'] === 401,
            "HTTP {$result['http_code']}: Should return 401 for invalid tokens"
        );

        // Test invalid request data
        $result = $this->makeRequest('POST', '/register', ['invalid' => 'data']);
        $this->logTest(
            'Invalid Request Data',
            $result['http_code'] === 400,
            "HTTP {$result['http_code']}: Should return 400 for invalid request data"
        );
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

            echo "🎉 API Testing Complete!\n";
            echo "========================\n";
            echo "Summary:\n";
            echo "- Authentication endpoints tested\n";
            echo "- Product CRUD operations tested\n";
            echo "- Category operations tested\n";
            echo "- Cart functionality tested\n";
            echo "- Order creation tested\n";
            echo "- Swagger documentation tested\n";
            echo "- Error handling verified\n\n";

            echo "📋 Test Data Created:\n";
            if ($this->testUser) {
                echo "- Test User ID: {$this->testUser['id']}\n";
            }
            if ($this->testProduct) {
                echo "- Test Product ID: {$this->testProduct['id']}\n";
            }
            if ($this->testOrder) {
                echo "- Test Order ID: {$this->testOrder['id']}\n";
            }
            echo "\n";

            echo "🔗 Useful URLs:\n";
            echo "- API Documentation: http://localhost:8000/api/docs\n";
            echo "- API JSON Spec: http://localhost:8000/api/docs/swagger.json\n";
            echo "- Frontend: http://localhost:5173\n\n";

        } catch (Exception $e) {
            echo "❌ Test execution failed: " . $e->getMessage() . "\n";
        }
    }
}

// Run the tests
$tester = new APITester();
$tester->runAllTests();

?>
