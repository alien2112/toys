<?php

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminController {
    private $db;
    
    // Valid order status transitions
    private $validTransitions = [
        'pending'    => ['paid', 'cancelled'],
        'paid'       => ['processing', 'cancelled', 'refunded'],
        'processing' => ['shipped', 'cancelled'],
        'shipped'    => ['delivered'],
        'delivered'  => ['refunded'],
        'cancelled'  => [],
        'refunded'   => [],
    ];

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getDashboardStats() {
        $user = AuthMiddleware::requireAdmin();

        try {
            // Total orders
            $stmt = $this->db->query("SELECT COUNT(*) as total FROM orders");
            $totalOrders = $stmt->fetch()['total'];

            // Total revenue
            $stmt = $this->db->query("SELECT SUM(total_amount) as revenue FROM orders WHERE status != 'cancelled'");
            $totalRevenue = $stmt->fetch()['revenue'] ?? 0;

            // Total products
            $stmt = $this->db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
            $totalProducts = $stmt->fetch()['total'];

            // Total users
            $stmt = $this->db->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
            $totalUsers = $stmt->fetch()['total'];

            // Recent orders
            $stmt = $this->db->prepare(
                "SELECT o.*, u.email, u.first_name, u.last_name 
                 FROM orders o 
                 JOIN users u ON o.user_id = u.id 
                 ORDER BY o.created_at DESC 
                 LIMIT 10"
            );
            $stmt->execute();
            $recentOrders = $stmt->fetchAll();

            // Low stock products
            $stmt = $this->db->prepare(
                "SELECT id, name, stock, price 
                 FROM products 
                 WHERE is_active = 1 AND stock < 10 
                 ORDER BY stock ASC 
                 LIMIT 10"
            );
            $stmt->execute();
            $lowStockProducts = $stmt->fetchAll();

            Response::success([
                'stats' => [
                    'total_orders' => $totalOrders,
                    'total_revenue' => $totalRevenue,
                    'total_products' => $totalProducts,
                    'total_users' => $totalUsers
                ],
                'recent_orders' => $recentOrders,
                'low_stock_products' => $lowStockProducts
            ]);
        } catch (Exception $e) {
            Response::error('Failed to fetch dashboard stats', 500);
        }
    }

    public function getAllOrders() {
        $user = AuthMiddleware::requireAdmin();

        $status = $_GET['status'] ?? null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        try {
            $sql = "SELECT o.*, u.email, u.first_name, u.last_name 
                    FROM orders o 
                    JOIN users u ON o.user_id = u.id";
            
            $params = [];
            
            if ($status) {
                $sql .= " WHERE o.status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll();

            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM orders o";
            if ($status) {
                $countSql .= " WHERE o.status = ?";
                $stmt = $this->db->prepare($countSql);
                $stmt->execute([$status]);
            } else {
                $stmt = $this->db->query($countSql);
            }
            $total = $stmt->fetch()['total'];

            Response::success([
                'orders' => $orders,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            Response::error('Failed to fetch orders', 500);
        }
    }

    public function updateOrderStatus($orderId) {
        $user = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['status'])) {
            Response::error('Status is required', 400);
        }

        $validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!in_array($data['status'], $validStatuses)) {
            Response::error('Invalid status value', 400);
        }

        try {
            require_once __DIR__ . '/../models/Order.php';
            $orderModel = new Order();
            
            $orderModel->updateStatus($orderId, $data['status'], $user['id'], $data['notes'] ?? null);
            
            // Get updated order with details
            $updatedOrder = $orderModel->getById($orderId);
            
            Response::success($updatedOrder, 'Order status updated successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function getAllUsers() {
        $user = AuthMiddleware::requireAdmin();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        try {
            $stmt = $this->db->prepare(
                "SELECT id, email, first_name, last_name, role, created_at 
                 FROM users 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?"
            );
            $stmt->execute([$limit, $offset]);
            $users = $stmt->fetchAll();

            $stmt = $this->db->query("SELECT COUNT(*) as total FROM users");
            $total = $stmt->fetch()['total'];

            Response::success([
                'users' => $users,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            Response::error('Failed to fetch users', 500);
        }
    }

    public function updateUserRole($userId) {
        $user = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['role'])) {
            Response::error('Role is required', 400);
        }

        if (!in_array($data['role'], ['user', 'admin'])) {
            Response::error('Invalid role', 400);
        }

        try {
            $stmt = $this->db->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$data['role'], $userId]);

            if ($stmt->rowCount() === 0) {
                Response::error('User not found', 404);
            }

            Response::success(['role' => $data['role']], 'User role updated successfully');
        } catch (Exception $e) {
            Response::error('Failed to update user role', 500);
        }
    }

    public function createCategory() {
        $user = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['slug'])) {
            Response::error('Name and slug are required', 400);
        }

        try {
            $stmt = $this->db->prepare(
                "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)"
            );
            $stmt->execute([
                $data['name'],
                $data['slug'],
                $data['description'] ?? null
            ]);

            $categoryId = $this->db->lastInsertId();
            
            $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$categoryId]);
            $category = $stmt->fetch();

            Response::success($category, 'Category created successfully', 201);
        } catch (Exception $e) {
            Response::error('Failed to create category', 500);
        }
    }

    public function updateCategory($categoryId) {
        $user = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['slug'])) {
            Response::error('Name and slug are required', 400);
        }

        try {
            $stmt = $this->db->prepare(
                "UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?"
            );
            $stmt->execute([
                $data['name'],
                $data['slug'],
                $data['description'] ?? null,
                $categoryId
            ]);

            if ($stmt->rowCount() === 0) {
                Response::error('Category not found', 404);
            }

            $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$categoryId]);
            $category = $stmt->fetch();

            Response::success($category, 'Category updated successfully');
        } catch (Exception $e) {
            Response::error('Failed to update category', 500);
        }
    }

    public function deleteCategory($categoryId) {
        $user = AuthMiddleware::requireAdmin();

        try {
            // Check if category has products
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
            $stmt->execute([$categoryId]);
            $count = $stmt->fetch()['count'];

            if ($count > 0) {
                Response::error('Cannot delete category with products', 400);
            }

            $stmt = $this->db->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$categoryId]);

            if ($stmt->rowCount() === 0) {
                Response::error('Category not found', 404);
            }

            Response::success(null, 'Category deleted successfully');
        } catch (Exception $e) {
            Response::error('Failed to delete category', 500);
        }
    }

    public function getOrderStatusHistory($orderId) {
        $user = AuthMiddleware::requireAdmin();

        try {
            require_once __DIR__ . '/../models/Order.php';
            $orderModel = new Order();
            
            $history = $orderModel->getStatusHistory($orderId);
            
            Response::success($history, 'Order status history retrieved successfully');
        } catch (Exception $e) {
            Response::error('Failed to get order status history', 500);
        }
    }
}
