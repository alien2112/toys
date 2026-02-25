<?php

/**
 * Swagger Documentation Route
 * Serves Swagger UI for API documentation
 */

require_once __DIR__ . '/../utils/Response.php';

class SwaggerController {
    public function index() {
        // Serve the Swagger UI HTML
        header('Content-Type: text/html');
        $swaggerHtml = '
<!DOCTYPE html>
<html>
<head>
    <title>TOYS Store API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.3/favicon-32x32.png" sizes="32x32" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
    <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/api/docs/swagger.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null
      });
    };
    </script>
</body>
</html>';
        echo $swaggerHtml;
    }

    public function json() {
        // Serve the OpenAPI JSON specification
        $swaggerJson = [
            "openapi" => "3.0.3",
            "info" => [
                "title" => "TOYS Store API",
                "version" => "1.0.0",
                "description" => "Comprehensive e-commerce API for TOYS store with full CRUD operations for products, orders, users, and more.",
                "contact" => [
                    "email" => "support@toystore.com"
                ],
                "license" => [
                    "name" => "MIT",
                    "url" => "https://opensource.org/licenses/MIT"
                ]
            ],
            "servers" => [
                [
                    "url" => "http://localhost:8000/api",
                    "description" => "Development server"
                ],
                [
                    "url" => "https://api.toystore.com/api",
                    "description" => "Production server"
                ]
            ],
            "security" => [
                [
                    "bearerAuth" => []
                ]
            ],
            "components" => [
                "securitySchemes" => [
                    "bearerAuth" => [
                        "type" => "http",
                        "scheme" => "bearer",
                        "bearerFormat" => "JWT"
                    ]
                ],
                "schemas" => [
                    "User" => [
                        "type" => "object",
                        "required" => ["id", "email", "first_name", "last_name"],
                        "properties" => [
                            "id" => ["type" => "integer", "description" => "User ID"],
                            "email" => ["type" => "string", "format" => "email", "description" => "User email"],
                            "first_name" => ["type" => "string", "description" => "User first name"],
                            "last_name" => ["type" => "string", "description" => "User last name"],
                            "role" => ["type" => "string", "enum" => ["user", "admin"], "description" => "User role"],
                            "created_at" => ["type" => "string", "format" => "date-time"],
                            "updated_at" => ["type" => "string", "format" => "date-time"]
                        ]
                    ],
                    "Product" => [
                        "type" => "object",
                        "required" => ["id", "name", "price", "stock"],
                        "properties" => [
                            "id" => ["type" => "integer", "description" => "Product ID"],
                            "name" => ["type" => "string", "description" => "Product name"],
                            "description" => ["type" => "string", "description" => "Product description"],
                            "price" => ["type" => "number", "format" => "float", "description" => "Product price"],
                            "stock" => ["type" => "integer", "description" => "Stock quantity"],
                            "image_url" => ["type" => "string", "description" => "Product image URL"],
                            "is_active" => ["type" => "boolean", "description" => "Product active status"],
                            "featured" => ["type" => "boolean", "description" => "Featured product"],
                            "category_id" => ["type" => "integer", "description" => "Category ID"],
                            "created_at" => ["type" => "string", "format" => "date-time"],
                            "updated_at" => ["type" => "string", "format" => "date-time"]
                        ]
                    ],
                    "Order" => [
                        "type" => "object",
                        "required" => ["id", "user_id", "total_amount", "status"],
                        "properties" => [
                            "id" => ["type" => "integer", "description" => "Order ID"],
                            "user_id" => ["type" => "integer", "description" => "User ID"],
                            "total_amount" => ["type" => "number", "format" => "float", "description" => "Order total"],
                            "status" => ["type" => "string", "enum" => ["pending", "processed", "shipping", "delivered", "cancelled"]],
                            "payment_method" => ["type" => "string", "enum" => ["cash_on_delivery", "credit_card", "paypal", "bank_transfer"]],
                            "payment_status" => ["type" => "string", "enum" => ["pending", "paid", "failed", "refunded"]],
                            "shipping_address" => ["type" => "string", "description" => "Shipping address"],
                            "created_at" => ["type" => "string", "format" => "date-time"],
                            "updated_at" => ["type" => "string", "format" => "date-time"],
                            "items" => [
                                "type" => "array",
                                "items" => ["\$ref" => "#/components/schemas/OrderItem"]
                            ]
                        ]
                    ],
                    "OrderItem" => [
                        "type" => "object",
                        "properties" => [
                            "id" => ["type" => "integer", "description" => "Order item ID"],
                            "product_id" => ["type" => "integer", "description" => "Product ID"],
                            "product_name" => ["type" => "string", "description" => "Product name"],
                            "quantity" => ["type" => "integer", "description" => "Quantity ordered"],
                            "price" => ["type" => "number", "format" => "float", "description" => "Unit price"]
                        ]
                    ],
                    "Category" => [
                        "type" => "object",
                        "required" => ["id", "name", "slug"],
                        "properties" => [
                            "id" => ["type" => "integer", "description" => "Category ID"],
                            "name" => ["type" => "string", "description" => "Category name"],
                            "slug" => ["type" => "string", "description" => "Category slug"],
                            "description" => ["type" => "string", "description" => "Category description"],
                            "image_url" => ["type" => "string", "description" => "Category image"],
                            "is_active" => ["type" => "boolean", "description" => "Category active status"]
                        ]
                    ],
                    "Review" => [
                        "type" => "object",
                        "required" => ["product_id", "rating", "comment"],
                        "properties" => [
                            "id" => ["type" => "integer", "description" => "Review ID"],
                            "product_id" => ["type" => "integer", "description" => "Product ID"],
                            "user_id" => ["type" => "integer", "description" => "User ID"],
                            "rating" => ["type" => "integer", "minimum" => 1, "maximum" => 5, "description" => "Rating (1-5)"],
                            "comment" => ["type" => "string", "description" => "Review comment"],
                            "is_verified" => ["type" => "boolean", "description" => "Purchase verified"],
                            "helpful_votes" => ["type" => "integer", "description" => "Helpful votes count"],
                            "created_at" => ["type" => "string", "format" => "date-time"]
                        ]
                    ],
                    "Error" => [
                        "type" => "object",
                        "properties" => [
                            "success" => ["type" => "boolean", "example" => false],
                            "message" => ["type" => "string", "description" => "Error message"],
                            "data" => ["type" => "object", "description" => "Additional error data"]
                        ]
                    ],
                    "Success" => [
                        "type" => "object",
                        "properties" => [
                            "success" => ["type" => "boolean", "example" => true],
                            "message" => ["type" => "string", "description" => "Success message"],
                            "data" => ["type" => "object", "description" => "Response data"]
                        ]
                    ]
                ]
            ],
            "tags" => [
                ["name" => "Authentication", "description" => "User authentication endpoints"],
                ["name" => "Products", "description" => "Product management endpoints"],
                ["name" => "Categories", "description" => "Category management endpoints"],
                ["name" => "Cart", "description" => "Shopping cart operations"],
                ["name" => "Orders", "description" => "Order management endpoints"],
                ["name" => "Reviews", "description" => "Product reviews and ratings"],
                ["name" => "Wishlist", "description" => "User wishlist management"],
                ["name" => "Blogs", "description" => "Blog and content management"],
                ["name" => "Payments", "description" => "Payment processing endpoints"],
                ["name" => "Admin", "description" => "Administrative operations"],
                ["name" => "Analytics", "description" => "Analytics and reporting"],
                ["name" => "Inventory", "description" => "Inventory management"],
                ["name" => "Suppliers", "description" => "Supplier management"],
                ["name" => "Support", "description" => "Customer support system"],
                ["name" => "Chat", "description" => "Live chat system"],
                ["name" => "Upload", "description" => "File upload operations"],
                ["name" => "Settings", "description" => "Application settings"]
            ],
            "paths" => [
                "/register" => [
                    "post" => [
                        "summary" => "Register a new user",
                        "description" => "Creates a new user account with email, password, and personal information",
                        "operationId" => "registerUser",
                        "tags" => ["Authentication"],
                        "requestBody" => [
                            "required" => true,
                            "content" => [
                                "application/json" => [
                                    "schema" => [
                                        "type" => "object",
                                        "required" => ["email", "password", "first_name", "last_name"],
                                        "properties" => [
                                            "email" => ["type" => "string", "format" => "email", "description" => "User email address"],
                                            "password" => ["type" => "string", "format" => "password", "minLength" => 8, "description" => "User password"],
                                            "first_name" => ["type" => "string", "description" => "User first name"],
                                            "last_name" => ["type" => "string", "description" => "User last name"]
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        "responses" => [
                            "201" => [
                                "description" => "User registered successfully",
                                "content" => [
                                    "application/json" => [
                                        "schema" => ["\$ref" => "#/components/schemas/Success"]
                                    ]
                                ]
                            ],
                            "400" => ["description" => "Invalid input data", "\$ref" => "#/components/schemas/Error"],
                            "409" => ["description" => "Email already exists", "\$ref" => "#/components/schemas/Error"],
                            "429" => ["description" => "Too many requests - rate limited", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ],
                "/login" => [
                    "post" => [
                        "summary" => "User login",
                        "description" => "Authenticates a user and returns a JWT token",
                        "operationId" => "loginUser",
                        "tags" => ["Authentication"],
                        "requestBody" => [
                            "required" => true,
                            "content" => [
                                "application/json" => [
                                    "schema" => [
                                        "type" => "object",
                                        "required" => ["email", "password"],
                                        "properties" => [
                                            "email" => ["type" => "string", "format" => "email", "description" => "User email address"],
                                            "password" => ["type" => "string", "format" => "password", "description" => "User password"]
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        "responses" => [
                            "200" => [
                                "description" => "Login successful",
                                "content" => [
                                    "application/json" => [
                                        "schema" => ["\$ref" => "#/components/schemas/Success"]
                                    ]
                                ]
                            ],
                            "400" => ["description" => "Invalid credentials", "\$ref" => "#/components/schemas/Error"],
                            "429" => ["description" => "Too many requests - rate limited", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ],
                "/me" => [
                    "get" => [
                        "summary" => "Get current user profile",
                        "description" => "Returns the authenticated user's profile information",
                        "operationId" => "getCurrentUser",
                        "tags" => ["Authentication"],
                        "security" => [["bearerAuth" => []]],
                        "responses" => [
                            "200" => [
                                "description" => "User profile retrieved successfully",
                                "content" => [
                                    "application/json" => [
                                        "schema" => [
                                            "type" => "object",
                                            "properties" => [
                                                "success" => ["type" => "boolean", "example" => true],
                                                "data" => ["\$ref" => "#/components/schemas/User"]
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            "401" => ["description" => "Unauthorized", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ],
                "/products" => [
                    "get" => [
                        "summary" => "Get all products with filtering",
                        "description" => "Returns a paginated list of products with optional filtering",
                        "operationId" => "getAllProducts",
                        "tags" => ["Products"],
                        "parameters" => [
                            ["name" => "page", "in" => "query", "schema" => ["type" => "integer", "default" => 1], "description" => "Page number"],
                            ["name" => "limit", "in" => "query", "schema" => ["type" => "integer", "default" => 20], "description" => "Items per page"],
                            ["name" => "category", "in" => "query", "schema" => ["type" => "string"], "description" => "Category slug to filter by"],
                            ["name" => "search", "in" => "query", "schema" => ["type" => "string"], "description" => "Search query"]
                        ],
                        "responses" => [
                            "200" => [
                                "description" => "Products retrieved successfully",
                                "content" => [
                                    "application/json" => [
                                        "schema" => ["\$ref" => "#/components/schemas/Success"]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    "post" => [
                        "summary" => "Create a new product",
                        "description" => "Creates a new product (Admin only)",
                        "operationId" => "createProduct",
                        "tags" => ["Products", "Admin"],
                        "security" => [["bearerAuth" => []]],
                        "requestBody" => [
                            "required" => true,
                            "content" => [
                                "application/json" => [
                                    "schema" => ["\$ref" => "#/components/schemas/Product"]
                                ]
                            ]
                        ],
                        "responses" => [
                            "201" => ["description" => "Product created successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]],
                            "400" => ["description" => "Invalid input data", "\$ref" => "#/components/schemas/Error"],
                            "401" => ["description" => "Unauthorized", "\$ref" => "#/components/schemas/Error"],
                            "403" => ["description" => "Forbidden - Admin access required", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ],
                "/products/{id}" => [
                    "get" => [
                        "summary" => "Get product by ID",
                        "description" => "Returns detailed information about a specific product",
                        "operationId" => "getProductById",
                        "tags" => ["Products"],
                        "parameters" => [
                            ["name" => "id", "in" => "path", "required" => true, "schema" => ["type" => "integer"], "description" => "Product ID"]
                        ],
                        "responses" => [
                            "200" => ["description" => "Product retrieved successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]],
                            "404" => ["description" => "Product not found", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ],
                    "put" => [
                        "summary" => "Update product",
                        "description" => "Updates an existing product (Admin only)",
                        "operationId" => "updateProduct",
                        "tags" => ["Products", "Admin"],
                        "security" => [["bearerAuth" => []]],
                        "parameters" => [
                            ["name" => "id", "in" => "path", "required" => true, "schema" => ["type" => "integer"], "description" => "Product ID"]
                        ],
                        "requestBody" => [
                            "required" => true,
                            "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Product"]]]
                        ],
                        "responses" => [
                            "200" => ["description" => "Product updated successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]],
                            "400" => ["description" => "Invalid input data", "\$ref" => "#/components/schemas/Error"],
                            "401" => ["description" => "Unauthorized", "\$ref" => "#/components/schemas/Error"],
                            "403" => ["description" => "Forbidden - Admin access required", "\$ref" => "#/components/schemas/Error"],
                            "404" => ["description" => "Product not found", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ],
                    "delete" => [
                        "summary" => "Delete product",
                        "description" => "Deletes a product (Admin only)",
                        "operationId" => "deleteProduct",
                        "tags" => ["Products", "Admin"],
                        "security" => [["bearerAuth" => []]],
                        "parameters" => [
                            ["name" => "id", "in" => "path", "required" => true, "schema" => ["type" => "integer"], "description" => "Product ID"]
                        ],
                        "responses" => [
                            "200" => ["description" => "Product deleted successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]],
                            "401" => ["description" => "Unauthorized", "\$ref" => "#/components/schemas/Error"],
                            "403" => ["description" => "Forbidden - Admin access required", "\$ref" => "#/components/schemas/Error"],
                            "404" => ["description" => "Product not found", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ],
                "/categories" => [
                    "get" => [
                        "summary" => "Get all categories",
                        "description" => "Returns a list of all active categories",
                        "operationId" => "getAllCategories",
                        "tags" => ["Categories"],
                        "responses" => [
                            "200" => ["description" => "Categories retrieved successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]]
                        ]
                    ]
                ],
                "/cart/{userId}" => [
                    "get" => [
                        "summary" => "Get user cart",
                        "description" => "Returns all items in the user's shopping cart",
                        "operationId" => "getCart",
                        "tags" => ["Cart"],
                        "security" => [["bearerAuth" => []]],
                        "parameters" => [
                            ["name" => "userId", "in" => "path", "required" => true, "schema" => ["type" => "integer"], "description" => "User ID"]
                        ],
                        "responses" => [
                            "200" => ["description" => "Cart retrieved successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]],
                            "401" => ["description" => "Unauthorized", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ],
                "/orders" => [
                    "post" => [
                        "summary" => "Create new order",
                        "description" => "Creates a new order from the user's cart",
                        "operationId" => "createOrder",
                        "tags" => ["Orders"],
                        "security" => [["bearerAuth" => []]],
                        "requestBody" => [
                            "required" => true,
                            "content" => [
                                "application/json" => [
                                    "schema" => [
                                        "type" => "object",
                                        "required" => ["items", "shipping_address"],
                                        "properties" => [
                                            "items" => ["type" => "array", "items" => ["type" => "object", "properties" => [
                                                "product_id" => ["type" => "integer"],
                                                "quantity" => ["type" => "integer"],
                                                "price" => ["type" => "number", "format" => "float"]
                                            ]]],
                                            "shipping_address" => ["type" => "string"],
                                            "payment_method" => ["type" => "string", "enum" => ["cash_on_delivery", "credit_card", "paypal", "bank_transfer"]]
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        "responses" => [
                            "201" => ["description" => "Order created successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]],
                            "400" => ["description" => "Invalid input data", "\$ref" => "#/components/schemas/Error"],
                            "401" => ["description" => "Unauthorized", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ],
                "/orders/{userId}" => [
                    "get" => [
                        "summary" => "Get user orders",
                        "description" => "Returns all orders for a specific user",
                        "operationId" => "getUserOrders",
                        "tags" => ["Orders"],
                        "security" => [["bearerAuth" => []]],
                        "parameters" => [
                            ["name" => "userId", "in" => "path", "required" => true, "schema" => ["type" => "integer"], "description" => "User ID"]
                        ],
                        "responses" => [
                            "200" => ["description" => "Orders retrieved successfully", "content" => ["application/json" => ["schema" => ["\$ref" => "#/components/schemas/Success"]]]],
                            "401" => ["description" => "Unauthorized", "\$ref" => "#/components/schemas/Error"]
                        ]
                    ]
                ]
            ]
        ];

        header('Content-Type: application/json');
        echo json_encode($swaggerJson);
    }
}
