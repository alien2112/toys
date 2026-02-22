<?php

require_once __DIR__ . '/../models/Supplier.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class SupplierController {
    private $supplierModel;

    public function __construct() {
        $this->supplierModel = new Supplier();
    }

    /**
     * Get all suppliers
     */
    public function getAll() {
        AuthMiddleware::requireAdmin();
        
        $activeOnly = $_GET['active_only'] ?? true;
        $suppliers = $this->supplierModel->getAll($activeOnly);
        
        Response::success($suppliers);
    }

    /**
     * Get supplier by ID
     */
    public function getById($id) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($id)) {
            Response::error('Invalid supplier ID', 400);
        }
        
        $supplier = $this->supplierModel->getById($id);
        
        if (!$supplier) {
            Response::error('Supplier not found', 404);
        }
        
        // Include statistics
        $stats = $this->supplierModel->getStats($id);
        $supplier['statistics'] = $stats;
        
        Response::success($supplier);
    }

    /**
     * Create new supplier
     */
    public function create() {
        AuthMiddleware::requireAdmin();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($data['name']) || empty(trim($data['name']))) {
            Response::error('Supplier name is required', 400);
        }
        
        // Validate email if provided
        if (isset($data['email']) && !empty($data['email'])) {
            if (!Validator::email($data['email'])) {
                Response::error('Invalid email address', 400);
            }
        }
        
        // Validate numeric fields
        if (isset($data['lead_time_days']) && (!Validator::integer($data['lead_time_days']) || $data['lead_time_days'] < 0)) {
            Response::error('Lead time must be a positive integer', 400);
        }
        
        if (isset($data['min_order_quantity']) && (!Validator::integer($data['min_order_quantity']) || $data['min_order_quantity'] < 1)) {
            Response::error('Minimum order quantity must be at least 1', 400);
        }
        
        if ($this->supplierModel->create($data)) {
            $supplierId = Database::getInstance()->getConnection()->lastInsertId();
            Response::success(['id' => $supplierId], 'Supplier created successfully', 201);
        } else {
            Response::error('Failed to create supplier', 500);
        }
    }

    /**
     * Update supplier
     */
    public function update($id) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($id)) {
            Response::error('Invalid supplier ID', 400);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate email if provided
        if (isset($data['email']) && !empty($data['email'])) {
            if (!Validator::email($data['email'])) {
                Response::error('Invalid email address', 400);
            }
        }
        
        // Validate numeric fields
        if (isset($data['lead_time_days']) && (!Validator::integer($data['lead_time_days']) || $data['lead_time_days'] < 0)) {
            Response::error('Lead time must be a positive integer', 400);
        }
        
        if (isset($data['min_order_quantity']) && (!Validator::integer($data['min_order_quantity']) || $data['min_order_quantity'] < 1)) {
            Response::error('Minimum order quantity must be at least 1', 400);
        }
        
        if ($this->supplierModel->update($id, $data)) {
            Response::success(null, 'Supplier updated successfully');
        } else {
            Response::error('Failed to update supplier or supplier not found', 404);
        }
    }

    /**
     * Delete supplier (soft delete)
     */
    public function delete($id) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($id)) {
            Response::error('Invalid supplier ID', 400);
        }
        
        if ($this->supplierModel->delete($id)) {
            Response::success(null, 'Supplier deleted successfully');
        } else {
            Response::error('Supplier not found', 404);
        }
    }

    /**
     * Search suppliers
     */
    public function search() {
        AuthMiddleware::requireAdmin();
        
        $query = $_GET['q'] ?? '';
        
        if (empty($query)) {
            Response::error('Search query is required', 400);
        }
        
        $activeOnly = $_GET['active_only'] ?? true;
        $suppliers = $this->supplierModel->search($query, $activeOnly);
        
        Response::success($suppliers);
    }
}
