<?php

require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Validator.php';

class ProductController {
    private $productModel;

    public function __construct() {
        $this->productModel = new Product();
    }

    public function getAll() {
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        $minPrice = $_GET['min_price'] ?? null;
        $maxPrice = $_GET['max_price'] ?? null;
        $sortBy = $_GET['sort_by'] ?? 'created_at';
        $sortOrder = $_GET['sort_order'] ?? 'DESC';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
        $offset = ($page - 1) * $limit;

        $products = $this->productModel->getAll($category, $limit, $offset, $search, $minPrice, $maxPrice, $sortBy, $sortOrder);
        $total = $this->productModel->getCount($category, $search, $minPrice, $maxPrice);

        Response::success([
            'products' => $products,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ],
            'filters' => [
                'category' => $category,
                'search' => $search,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder
            ]
        ]);
    }

    public function getById($id) {
        $product = $this->productModel->getById($id);

        if (!$product) {
            Response::error('Product not found', 404);
        }

        Response::success($product);
    }

    /**
     * Get search suggestions
     */
    public function getSearchSuggestions() {
        $query = $_GET['q'] ?? '';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
        
        if (strlen($query) < 2) {
            Response::success([]);
            return;
        }

        $suggestions = $this->productModel->getSearchSuggestions($query, $limit);
        Response::success($suggestions);
    }

    /**
     * Get popular search terms
     */
    public function getPopularSearches() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $popular = $this->productModel->getPopularSearchTerms($limit);
        Response::success($popular);
    }


    public function create() {
        $user = AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['price'])) {
            Response::error('Missing required fields', 400);
        }

        if (!Validator::price($data['price'])) {
            Response::error('Price must be a positive number greater than zero', 400);
        }

        if (isset($data['stock']) && (!is_numeric($data['stock']) || (int)$data['stock'] < 0)) {
            Response::error('Stock cannot be negative', 400);
        }

        try {
            // Generate slug if not provided
            if (!isset($data['slug']) || empty($data['slug'])) {
                // Better slug generation for Arabic text
                $slug = $data['name'];
                // Remove special characters but keep Arabic letters
                $slug = preg_replace('/[^\p{Arabic}\p{L}\p{N}\s-]/u', '', $slug);
                // Replace spaces with hyphens
                $slug = preg_replace('/\s+/', '-', $slug);
                // Remove multiple consecutive hyphens
                $slug = preg_replace('/-+/', '-', $slug);
                // Trim hyphens from start and end
                $slug = trim($slug, '-');
                // If slug is empty or just hyphens, use timestamp
                if (empty($slug) || $slug === '-') {
                    $slug = 'product-' . time();
                }
                // Make unique by adding timestamp if needed
                $slug .= '-' . substr(md5(time() . rand()), 0, 6);
            } else {
                $slug = $data['slug'];
            }

            $productId = $this->productModel->create(
                $data['name'],
                $slug,
                $data['description'] ?? null,
                $data['price'],
                $data['category_id'] ?? null,
                $data['image_url'] ?? null,
                $data['stock'] ?? 0
            );

            $product = $this->productModel->getById($productId);
            Response::success($product, 'Product created successfully', 201);
        } catch (Exception $e) {
            error_log('Product create error: ' . $e->getMessage());
            Response::error('Failed to create product: ' . $e->getMessage(), 500);
        }
    }

    public function update($id) {
        $user = AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['price'])) {
            Response::error('Missing required fields', 400);
        }

        if (!Validator::price($data['price'])) {
            Response::error('Price must be a positive number greater than zero', 400);
        }

        if (isset($data['stock']) && (!is_numeric($data['stock']) || (int)$data['stock'] < 0)) {
            Response::error('Stock cannot be negative', 400);
        }

        try {
            // Generate slug if not provided
            if (!isset($data['slug']) || empty($data['slug'])) {
                // Better slug generation for Arabic text
                $slug = $data['name'];
                // Remove special characters but keep Arabic letters
                $slug = preg_replace('/[^\p{Arabic}\p{L}\p{N}\s-]/u', '', $slug);
                // Replace spaces with hyphens
                $slug = preg_replace('/\s+/', '-', $slug);
                // Remove multiple consecutive hyphens
                $slug = preg_replace('/-+/', '-', $slug);
                // Trim hyphens from start and end
                $slug = trim($slug, '-');
                // If slug is empty or just hyphens, use product ID
                if (empty($slug) || $slug === '-') {
                    $slug = 'product-' . $id . '-' . time();
                }
            } else {
                $slug = $data['slug'];
            }
            
            $this->productModel->update(
                $id,
                $data['name'],
                $slug,
                $data['description'] ?? null,
                $data['price'],
                $data['category_id'] ?? null,
                $data['image_url'] ?? null,
                $data['stock'] ?? 0
            );

            $product = $this->productModel->getById($id);
            Response::success($product, 'Product updated successfully');
        } catch (Exception $e) {
            error_log('Product update error: ' . $e->getMessage());
            Response::error('Failed to update product: ' . $e->getMessage(), 500);
        }
    }

    public function delete($id) {
        $user = AuthMiddleware::requireAdmin();

        try {
            $this->productModel->delete($id);
            Response::success(null, 'Product deleted successfully');
        } catch (Exception $e) {
            Response::error('Failed to delete product', 500);
        }
    }

    public function getFeatured() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 4;
        $products = $this->productModel->getFeatured($limit);
        Response::success($products);
    }

    public function getTopRated() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 4;
        $products = $this->productModel->getTopRated($limit);
        Response::success($products);
    }

    public function toggleFeatured($id) {
        $user = AuthMiddleware::requireAdmin();

        try {
            $this->productModel->toggleFeatured($id);
            $product = $this->productModel->getById($id);
            Response::success($product, 'Featured status updated successfully');
        } catch (Exception $e) {
            error_log('Toggle featured error: ' . $e->getMessage());
            Response::error('Failed to update featured status: ' . $e->getMessage(), 500);
        }
    }
}
