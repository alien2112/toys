<?php

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/CartController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/ReviewController.php';
require_once __DIR__ . '/../controllers/UploadController.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../controllers/SettingsController.php';
require_once __DIR__ . '/../controllers/AdminSeederController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/BlogController.php';
require_once __DIR__ . '/../controllers/PaymentController.php';
require_once __DIR__ . '/../controllers/AnalyticsController.php';
require_once __DIR__ . '/../controllers/WishlistController.php';
require_once __DIR__ . '/../controllers/InventoryController.php';
require_once __DIR__ . '/../controllers/SupplierController.php';
require_once __DIR__ . '/../controllers/SupportController.php';
require_once __DIR__ . '/../controllers/ChatController.php';
require_once __DIR__ . '/../controllers/ProductVariantController.php';
require_once __DIR__ . '/../controllers/SwaggerController.php';

class Router {
    private $routes = [];

    public function add($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch($method, $uri) {
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = str_replace('/api', '', $uri);

        foreach ($this->routes as $route) {
            $pattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([a-zA-Z0-9_]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if ($route['method'] === $method && preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        Response::error('Route not found', 404);
    }
}

$router = new Router();

$authController = new AuthController();
$productController = new ProductController();
$cartController = new CartController();
$orderController = new OrderController();
$reviewController = new ReviewController();
$uploadController = new UploadController();
$adminController = new AdminController();
$settingsController = new SettingsController();
$seederController = new AdminSeederController();
$categoryController = new CategoryController();
$blogController = new BlogController();
$paymentController = new PaymentController();
$analyticsController = new AnalyticsController();
$wishlistController = new WishlistController();
$inventoryController = new InventoryController();
$supplierController = new SupplierController();
$supportController = new SupportController();
$chatController = new ChatController();
$variantController = new ProductVariantController();
$swaggerController = new SwaggerController();

$router->add('POST', '/register', [$authController, 'register']);
$router->add('POST', '/login', [$authController, 'login']);
$router->add('GET', '/me', [$authController, 'getMe']);

$router->add('GET', '/products/featured', [$productController, 'getFeatured']);
$router->add('GET', '/products/top-rated', [$productController, 'getTopRated']);
$router->add('GET', '/products', [$productController, 'getAll']);
$router->add('GET', '/products/{id}', [$productController, 'getById']);
$router->add('GET', '/products/search/suggestions', [$productController, 'getSearchSuggestions']);
$router->add('GET', '/products/search/popular', [$productController, 'getPopularSearches']);
$router->add('POST', '/products', [$productController, 'create']);
$router->add('PUT', '/products/{id}', [$productController, 'update']);
$router->add('PUT', '/products/{id}/toggle-featured', [$productController, 'toggleFeatured']);
$router->add('DELETE', '/products/{id}', [$productController, 'delete']);

// Product variant routes
$router->add('GET', '/products/{productId}/variants', [$variantController, 'getByProductId']);
$router->add('GET', '/variants/{id}', [$variantController, 'getById']);
$router->add('POST', '/products/{productId}/variants', [$variantController, 'create']);
$router->add('PUT', '/variants/{id}', [$variantController, 'update']);
$router->add('DELETE', '/variants/{id}', [$variantController, 'delete']);

// Variant management routes
$router->add('GET', '/admin/variant-types', [$variantController, 'getVariantTypes']);
$router->add('POST', '/admin/variant-types', [$variantController, 'createVariantType']);
$router->add('GET', '/admin/variant-types/{typeId}/options', [$variantController, 'getVariantOptions']);
$router->add('POST', '/admin/variant-options', [$variantController, 'createVariantOption']);

$router->add('POST', '/cart', [$cartController, 'addToCart']);
$router->add('GET', '/cart/{userId}', [$cartController, 'getCart']);
$router->add('PUT', '/cart/{cartItemId}', [$cartController, 'updateCartItem']);
$router->add('DELETE', '/cart/{cartItemId}', [$cartController, 'removeCartItem']);
$router->add('DELETE', '/cart', [$cartController, 'clearCart']);
$router->add('POST', '/cart/validate', [$cartController, 'validateCart']);

$router->add('POST', '/orders', [$orderController, 'create']);
$router->add('GET', '/orders/{userId}', [$orderController, 'getByUserId']);
$router->add('GET', '/orders/{id}/details', [$orderController, 'getById']);

$router->add('POST', '/reviews', [$reviewController, 'create']);
$router->add('PUT', '/reviews/{id}', [$reviewController, 'update']);
$router->add('DELETE', '/reviews/{id}', [$reviewController, 'delete']);
$router->add('GET', '/products/{productId}/reviews', [$reviewController, 'getByProductId']);
$router->add('GET', '/products/{productId}/reviews/stats', [$reviewController, 'getRatingStats']);
$router->add('POST', '/reviews/{id}/helpful', [$reviewController, 'addHelpfulVote']);
$router->add('GET', '/user/reviews', [$reviewController, 'getUserReviews']);

// Admin review management routes
$router->add('GET', '/admin/reviews', [$reviewController, 'getAllReviews']);
$router->add('PUT', '/admin/reviews/{id}/status', [$reviewController, 'updateReviewStatus']);

$router->add('POST', '/upload/product', [$uploadController, 'uploadProductImage']);
$router->add('POST', '/upload/banner', [$uploadController, 'uploadBannerImage']);
$router->add('POST', '/upload/category', [$uploadController, 'uploadCategoryImage']);
$router->add('POST', '/upload/user', [$uploadController, 'uploadUserImage']);
$router->add('POST', '/upload/logo', [$uploadController, 'uploadLogoImage']);
$router->add('DELETE', '/upload', [$uploadController, 'deleteImage']);

// Category routes (public)
$router->add('GET', '/categories', [$categoryController, 'getAll']);
$router->add('GET', '/categories/search', [$categoryController, 'search']);
$router->add('GET', '/categories/{id}', [$categoryController, 'getById']);

// Admin category routes
$router->add('POST', '/admin/categories', [$categoryController, 'create']);
$router->add('PUT', '/admin/categories/{id}', [$categoryController, 'update']);
$router->add('DELETE', '/admin/categories/{id}', [$categoryController, 'delete']);

// Admin routes
$router->add('GET', '/admin/dashboard', [$adminController, 'getDashboardStats']);
$router->add('GET', '/admin/orders', [$adminController, 'getAllOrders']);
$router->add('PUT', '/admin/orders/{orderId}/status', [$adminController, 'updateOrderStatus']);
$router->add('GET', '/admin/orders/{orderId}/status-history', [$adminController, 'getOrderStatusHistory']);
$router->add('GET', '/admin/users', [$adminController, 'getAllUsers']);
$router->add('PUT', '/admin/users/{userId}/role', [$adminController, 'updateUserRole']);

// Settings routes
$router->add('GET', '/settings', [$settingsController, 'getSettings']);
$router->add('PUT', '/admin/settings', [$settingsController, 'updateSettings']);

// Admin Seeder routes
$router->add('GET', '/admin/seeder', [$seederController, 'getStatus']);
$router->add('GET', '/admin/seeder/preview', [$seederController, 'previewData']);
$router->add('POST', '/admin/seeder/seed-products', [$seederController, 'seedProducts']);
$router->add('POST', '/admin/seeder/seed-users', [$seederController, 'seedUsers']);
$router->add('POST', '/admin/seeder/seed-images', [$seederController, 'seedImages']);
$router->add('POST', '/admin/seeder/seed-all', [$seederController, 'seedAll']);

// Blog routes (public)
$router->add('GET', '/blogs', [$blogController, 'getBlogs']);
$router->add('GET', '/blogs/featured', [$blogController, 'getFeaturedBlogs']);
$router->add('GET', '/blogs/trending', [$blogController, 'getTrendingBlogs']);
$router->add('GET', '/blogs/{id}', [$blogController, 'getBlogById']);
$router->add('GET', '/blogs/slug/{slug}', [$blogController, 'getBlogBySlug']);
$router->add('GET', '/blogs/{id}/related', [$blogController, 'getRelatedBlogs']);
$router->add('GET', '/blog/categories', [$blogController, 'getCategories']);
$router->add('GET', '/blog/tags', [$blogController, 'getTags']);

// Admin blog routes
$router->add('GET', '/admin/blogs', [$blogController, 'getBlogsForAdmin']);
$router->add('GET', '/admin/blogs/count', [$blogController, 'getBlogsCount']);
$router->add('POST', '/admin/blogs', [$blogController, 'createBlog']);
$router->add('PUT', '/admin/blogs/{id}', [$blogController, 'updateBlog']);
$router->add('DELETE', '/admin/blogs/{id}', [$blogController, 'deleteBlog']);
$router->add('PUT', '/admin/blogs/{id}/toggle-featured', [$blogController, 'toggleFeatured']);

// Wishlist routes
$router->add('GET', '/wishlist', [$wishlistController, 'getDefaultWishlist']);
$router->add('GET', '/wishlists', [$wishlistController, 'getUserWishlists']);
$router->add('POST', '/wishlist', [$wishlistController, 'addItem']);
$router->add('DELETE', '/wishlist/{productId}', [$wishlistController, 'removeItem']);
$router->add('PUT', '/wishlist/{productId}/stock-alert', [$wishlistController, 'toggleStockAlert']);
$router->add('PUT', '/wishlist/sharing', [$wishlistController, 'updateSharing']);
$router->add('POST', '/wishlists', [$wishlistController, 'createWishlist']);
$router->add('DELETE', '/wishlists/{wishlistId}', [$wishlistController, 'deleteWishlist']);
$router->add('GET', '/wishlist/share/{shareToken}', [$wishlistController, 'getPublicWishlist']);
$router->add('GET', '/admin/wishlist/stock-alerts', [$wishlistController, 'getStockAlertItems']);

// Inventory routes
$router->add('GET', '/admin/inventory/low-stock', [$inventoryController, 'getLowStockAlerts']);
$router->add('POST', '/admin/inventory/low-stock', [$inventoryController, 'setLowStockAlert']);
$router->add('GET', '/admin/inventory/movements/{productId}', [$inventoryController, 'getInventoryMovements']);
$router->add('POST', '/inventory/reservations', [$inventoryController, 'createReservation']);
$router->add('GET', '/inventory/reservations', [$inventoryController, 'getUserReservations']);
$router->add('PUT', '/admin/inventory/batch-update', [$inventoryController, 'batchUpdate']);
$router->add('POST', '/admin/inventory/expire-reservations', [$inventoryController, 'expireReservations']);
$router->add('GET', '/inventory/available-stock/{productId}', [$inventoryController, 'getAvailableStock']);

// Supplier routes
$router->add('GET', '/admin/suppliers', [$supplierController, 'getAll']);
$router->add('GET', '/admin/suppliers/search', [$supplierController, 'search']);
$router->add('GET', '/admin/suppliers/{id}', [$supplierController, 'getById']);
$router->add('POST', '/admin/suppliers', [$supplierController, 'create']);
$router->add('PUT', '/admin/suppliers/{id}', [$supplierController, 'update']);
$router->add('DELETE', '/admin/suppliers/{id}', [$supplierController, 'delete']);

// Support routes
$router->add('POST', '/support/tickets', [$supportController, 'createTicket']);
$router->add('GET', '/support/tickets', [$supportController, 'getUserTickets']);
$router->add('GET', '/support/tickets/{id}', [$supportController, 'getTicket']);
$router->add('POST', '/support/tickets/{id}/replies', [$supportController, 'addReply']);
$router->add('GET', '/support/categories', [$supportController, 'getCategories']);

// Admin support routes
$router->add('GET', '/admin/support/tickets', [$supportController, 'getAllTickets']);
$router->add('GET', '/admin/support/tickets/{id}', [$supportController, 'getTicketDetails']);
$router->add('POST', '/admin/support/tickets/{id}/replies', [$supportController, 'addAdminReply']);
$router->add('PUT', '/admin/support/tickets/{id}/status', [$supportController, 'updateTicketStatus']);
$router->add('PUT', '/admin/support/tickets/{id}/assign', [$supportController, 'assignTicket']);
$router->add('GET', '/admin/support/stats', [$supportController, 'getTicketStats']);

// Chat routes
$router->add('POST', '/chat/sessions', [$chatController, 'createSession']);
$router->add('GET', '/chat/sessions/{sessionId}/messages', [$chatController, 'getSessionMessages']);
$router->add('POST', '/chat/sessions/{sessionId}/messages', [$chatController, 'sendMessage']);
$router->add('PUT', '/chat/sessions/{sessionId}/end', [$chatController, 'endSession']);

// Admin chat routes
$router->add('GET', '/admin/chat/sessions', [$chatController, 'getActiveSessions']);
$router->add('PUT', '/admin/chat/sessions/{sessionId}/assign', [$chatController, 'assignAgent']);
$router->add('PUT', '/admin/chat/sessions/{sessionId}/transfer', [$chatController, 'transferSession']);
$router->add('GET', '/admin/chat/stats', [$chatController, 'getChatStats']);

// Payment routes
$router->add('POST', '/payments/create', [$paymentController, 'createPaymentIntent']);
$router->add('GET', '/payments/{id}', [$paymentController, 'getPaymentStatus']);
$router->add('POST', '/payments/moyasar/callback', [$paymentController, 'moyasarCallback']);
$router->add('POST', '/payments/stripe/webhook', [$paymentController, 'stripeWebhook']);

// Analytics routes
$router->add('POST', '/analytics/track', [$analyticsController, 'trackEvent']);
$router->add('GET', '/admin/analytics/sales', [$analyticsController, 'getSalesAnalytics']);
$router->add('GET', '/admin/analytics/customer-behavior', [$analyticsController, 'getCustomerBehaviorAnalytics']);
$router->add('GET', '/admin/analytics/inventory', [$analyticsController, 'getInventoryAnalytics']);
$router->add('GET', '/admin/analytics/cro', [$analyticsController, 'getCROAnalytics']);
$router->add('GET', '/admin/analytics/export', [$analyticsController, 'exportAnalytics']);
$router->add('POST', '/admin/analytics/update-summaries', [$analyticsController, 'updateDailySummaries']);

// Swagger documentation routes
$router->add('GET', '/docs', [$swaggerController, 'index']);
$router->add('GET', '/docs/swagger.json', [$swaggerController, 'json']);

return $router;
