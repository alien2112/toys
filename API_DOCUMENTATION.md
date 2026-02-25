# TOYS Store API Documentation

## Overview

The TOYS Store API is a comprehensive e-commerce backend system built with PHP and MySQL. It provides full CRUD operations for products, orders, users, and more. The API includes authentication, payment processing, inventory management, analytics, and customer support features.

## Getting Started

### Prerequisites
- PHP 8.0 or higher
- MySQL 5.7 or higher
- Composer (for dependency management)

### Installation
1. Clone the repository
2. Install dependencies: `composer install`
3. Set up your database configuration in `config/config.php`
4. Run database migrations
5. Start the development server: `php -S localhost:8000 -t public`

### API Base URL
```
http://localhost:8000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /me
Authorization: Bearer <token>
```

## Products

### Product Endpoints

#### Get All Products
```http
GET /products?page=1&limit=20&category=toys&search=lego&min_price=10&max_price=100&sort_by=price&sort_order=asc
```

#### Get Featured Products
```http
GET /products/featured?limit=10
```

#### Get Top Rated Products
```http
GET /products/top-rated?limit=10
```

#### Get Product by ID
```http
GET /products/{id}
```

#### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Lego Set",
  "description": "Creative building blocks",
  "price": 49.99,
  "stock": 100,
  "category_id": 1,
  "image_url": "/products/lego.jpg",
  "is_active": true,
  "featured": false
}
```

#### Update Product (Admin Only)
```http
PUT /products/{id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Lego Set",
  "price": 59.99
}
```

#### Delete Product (Admin Only)
```http
DELETE /products/{id}
Authorization: Bearer <admin-token>
```

## Categories

### Category Endpoints

#### Get All Categories
```http
GET /categories
```

#### Get Category by ID
```http
GET /categories/{id}
```

#### Create Category (Admin Only)
```http
POST /admin/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Building Blocks",
  "slug": "building-blocks",
  "description": "Creative construction toys",
  "image_url": "/categories/blocks.jpg",
  "is_active": true
}
```

## Shopping Cart

### Cart Endpoints

#### Get User Cart
```http
GET /cart/{userId}
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /cart/{cartItemId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Cart Item
```http
DELETE /cart/{cartItemId}
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

## Orders

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 49.99
    }
  ],
  "shipping_address": "123 Main St, Riyadh, Saudi Arabia",
  "payment_method": "cash_on_delivery"
}
```

#### Get User Orders
```http
GET /orders/{userId}
Authorization: Bearer <token>
```

#### Get Order Details
```http
GET /orders/{orderId}/details
Authorization: Bearer <token>
```

### Payment Methods
- `cash_on_delivery`: Pay when order is delivered
- `credit_card`: Online payment via credit card
- `paypal`: PayPal payment
- `bank_transfer`: Bank transfer payment

## Reviews & Ratings

### Review Endpoints

#### Get Product Reviews
```http
GET /products/{productId}/reviews?page=1&limit=10
```

#### Get Product Rating Stats
```http
GET /products/{productId}/reviews/stats
```

#### Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "rating": 5,
  "comment": "Excellent product quality!"
}
```

#### Update Review
```http
PUT /reviews/{reviewId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Good product, fast delivery"
}
```

#### Delete Review
```http
DELETE /reviews/{reviewId}
Authorization: Bearer <token>
```

## Wishlist

### Wishlist Endpoints

#### Get User Wishlist
```http
GET /wishlist
Authorization: Bearer <token>
```

#### Add Item to Wishlist
```http
POST /wishlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1
}
```

#### Remove Item from Wishlist
```http
DELETE /wishlist/{productId}
Authorization: Bearer <token>
```

## Admin Operations

### Dashboard & Analytics
```http
GET /admin/dashboard
Authorization: Bearer <admin-token>
```

### User Management
```http
GET /admin/users
PUT /admin/users/{userId}/role
Authorization: Bearer <admin-token>
```

### Order Management
```http
GET /admin/orders
PUT /admin/orders/{orderId}/status
Authorization: Bearer <admin-token>
```

## Blogs & Content

### Blog Endpoints

#### Get Blogs
```http
GET /blogs?page=1&limit=10&category=parenting
```

#### Get Featured Blogs
```http
GET /blogs/featured
```

#### Get Blog by ID
```http
GET /blogs/{id}
```

#### Get Blog Categories
```http
GET /blog/categories
```

## File Upload

### Upload Endpoints

#### Upload Product Image
```http
POST /upload/product
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

#### Upload Banner Image
```http
POST /upload/banner
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

file: <image_file>
```

## Error Responses

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": {
    "field": "validation_error_details"
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- General endpoints: 100 requests per minute
- Authentication endpoints: 5 attempts per 15 minutes
- Order creation: 10 orders per hour per IP

## Testing

Run the comprehensive API test suite:

```bash
cd backend
php test_api.php
```

This will test all endpoints and provide detailed results.

## API Documentation

### Swagger UI
Access the interactive API documentation at:
```
http://localhost:8000/api/docs
```

### OpenAPI Specification
Download the OpenAPI JSON specification:
```
http://localhost:8000/api/docs/swagger.json
```

## Database Schema

The API uses the following main tables:
- `users`: User accounts and authentication
- `products`: Product catalog
- `categories`: Product categories
- `orders`: Customer orders
- `order_items`: Order line items
- `payments`: Payment transactions
- `reviews`: Product reviews and ratings
- `cart`: Shopping cart items
- `wishlist`: User wishlists
- `blogs`: Blog posts and content

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- SQL injection prevention with prepared statements
- XSS protection with input sanitization
- Rate limiting
- CORS configuration
- CSRF protection

## Contributing

1. Follow the existing code structure
2. Add appropriate OpenAPI annotations
3. Update tests when adding new endpoints
4. Ensure all endpoints are documented in Swagger

## Support

For API support or questions:
- Email: support@toystore.com
- Documentation: http://localhost:8000/api/docs
