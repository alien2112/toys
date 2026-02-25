<?php

/**
 * @OA\Info(
 *     title="TOYS Store API",
 *     version="1.0.0",
 *     description="A comprehensive e-commerce API for the TOYS store with full CRUD operations for products, orders, users, and more.",
 *     @OA\Contact(
 *         email="support@toystore.com"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Development server"
 * )
 *
 * @OA\Server(
 *     url="https://api.toystore.com/api",
 *     description="Production server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="JWT Authorization header using the Bearer scheme."
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Products",
 *     description="Product management endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Categories",
 *     description="Category management endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Cart",
 *     description="Shopping cart operations"
 * )
 *
 * @OA\Tag(
 *     name="Orders",
 *     description="Order management endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Reviews",
 *     description="Product reviews and ratings"
 * )
 *
 * @OA\Tag(
 *     name="Wishlist",
 *     description="User wishlist management"
 * )
 *
 * @OA\Tag(
 *     name="Blogs",
 *     description="Blog and content management"
 * )
 *
 * @OA\Tag(
 *     name="Payments",
 *     description="Payment processing endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Admin",
 *     description="Administrative operations"
 * )
 *
 * @OA\Tag(
 *     name="Analytics",
 *     description="Analytics and reporting"
 * )
 *
 * @OA\Tag(
 *     name="Inventory",
 *     description="Inventory management"
 * )
 *
 * @OA\Tag(
 *     name="Suppliers",
 *     description="Supplier management"
 * )
 *
 * @OA\Tag(
 *     name="Support",
 *     description="Customer support system"
 * )
 *
 * @OA\Tag(
 *     name="Chat",
 *     description="Live chat system"
 * )
 *
 * @OA\Tag(
 *     name="Upload",
 *     description="File upload operations"
 * )
 *
 * @OA\Tag(
 *     name="Settings",
 *     description="Application settings"
 * )
 */
