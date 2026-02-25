<?php

require_once __DIR__ . '/../models/ProductVariant.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Validator.php';

class ProductVariantController {
    private $variantModel;

    public function __construct() {
        $this->variantModel = new ProductVariant();
    }

    /**
     * Get all variants for a product
     */
    public function getByProductId($productId) {
        try {
            $variants = $this->variantModel->getByProductId($productId);
            Response::success($variants);
        } catch (Exception $e) {
            error_log('Get variants error: ' . $e->getMessage());
            Response::error('Failed to fetch variants', 500);
        }
    }

    /**
     * Get a single variant by ID
     */
    public function getById($id) {
        try {
            $variant = $this->variantModel->getById($id);
            
            if (!$variant) {
                Response::error('Variant not found', 404);
            }
            
            Response::success($variant);
        } catch (Exception $e) {
            error_log('Get variant error: ' . $e->getMessage());
            Response::error('Failed to fetch variant', 500);
        }
    }

    /**
     * Create a new variant for a product
     */
    public function create($productId) {
        $user = AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!isset($data['sku']) || !isset($data['price'])) {
            Response::error('Missing required fields: sku, price', 400);
        }

        // Validate SKU uniqueness
        if (!$this->variantModel->isSkuUnique($data['sku'])) {
            Response::error('SKU already exists', 400);
        }

        // Validate price
        if (!Validator::price($data['price'])) {
            Response::error('Price must be a positive number greater than zero', 400);
        }

        // Validate stock
        if (isset($data['stock']) && (!is_numeric($data['stock']) || (int)$data['stock'] < 0)) {
            Response::error('Stock cannot be negative', 400);
        }

        // Validate variant options
        if (!isset($data['variant_options']) || !is_array($data['variant_options']) || empty($data['variant_options'])) {
            Response::error('Variant options are required', 400);
        }

        try {
            // Create variant
            $variantId = $this->variantModel->create(
                $productId,
                $data['sku'],
                $data['price'],
                $data['stock'] ?? 0,
                $data['image_url'] ?? null,
                $data['is_active'] ?? true
            );

            // Add variant options
            foreach ($data['variant_options'] as $optionId) {
                $this->variantModel->addVariantOption($variantId, $optionId);
            }

            // Update product to indicate it has variants
            $this->variantModel->updateProductHasVariants($productId, true);

            $variant = $this->variantModel->getById($variantId);
            Response::success($variant, 'Variant created successfully', 201);
        } catch (Exception $e) {
            error_log('Create variant error: ' . $e->getMessage());
            Response::error('Failed to create variant: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update a variant
     */
    public function update($id) {
        $user = AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!isset($data['sku']) || !isset($data['price'])) {
            Response::error('Missing required fields: sku, price', 400);
        }

        // Check if variant exists
        $existingVariant = $this->variantModel->getById($id);
        if (!$existingVariant) {
            Response::error('Variant not found', 404);
        }

        // Validate SKU uniqueness (excluding current variant)
        if (!$this->variantModel->isSkuUnique($data['sku'], $id)) {
            Response::error('SKU already exists', 400);
        }

        // Validate price
        if (!Validator::price($data['price'])) {
            Response::error('Price must be a positive number greater than zero', 400);
        }

        // Validate stock
        if (isset($data['stock']) && (!is_numeric($data['stock']) || (int)$data['stock'] < 0)) {
            Response::error('Stock cannot be negative', 400);
        }

        try {
            // Update variant
            $this->variantModel->update(
                $id,
                $data['sku'],
                $data['price'],
                $data['stock'] ?? 0,
                $data['image_url'] ?? null,
                $data['is_active'] ?? true
            );

            // Update variant options if provided
            if (isset($data['variant_options']) && is_array($data['variant_options'])) {
                // Remove existing options
                $this->variantModel->removeAllVariantOptions($id);
                
                // Add new options
                foreach ($data['variant_options'] as $optionId) {
                    $this->variantModel->addVariantOption($id, $optionId);
                }
            }

            $variant = $this->variantModel->getById($id);
            Response::success($variant, 'Variant updated successfully');
        } catch (Exception $e) {
            error_log('Update variant error: ' . $e->getMessage());
            Response::error('Failed to update variant: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a variant
     */
    public function delete($id) {
        $user = AuthMiddleware::requireAdmin();

        try {
            $variant = $this->variantModel->getById($id);
            if (!$variant) {
                Response::error('Variant not found', 404);
            }

            $productId = $variant['product_id'];
            
            // Delete variant
            $this->variantModel->delete($id);

            // Check if product still has variants
            $remainingVariants = $this->variantModel->getByProductId($productId);
            if (empty($remainingVariants)) {
                $this->variantModel->updateProductHasVariants($productId, false);
            }

            Response::success(null, 'Variant deleted successfully');
        } catch (Exception $e) {
            error_log('Delete variant error: ' . $e->getMessage());
            Response::error('Failed to delete variant', 500);
        }
    }

    /**
     * Get all variant types
     */
    public function getVariantTypes() {
        try {
            $types = $this->variantModel->getVariantTypes();
            Response::success($types);
        } catch (Exception $e) {
            error_log('Get variant types error: ' . $e->getMessage());
            Response::error('Failed to fetch variant types', 500);
        }
    }

    /**
     * Get variant options by type
     */
    public function getVariantOptions($typeId) {
        try {
            $options = $this->variantModel->getVariantOptionsByType($typeId);
            Response::success($options);
        } catch (Exception $e) {
            error_log('Get variant options error: ' . $e->getMessage());
            Response::error('Failed to fetch variant options', 500);
        }
    }

    /**
     * Create a new variant type
     */
    public function createVariantType() {
        $user = AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name'])) {
            Response::error('Missing required field: name', 400);
        }

        try {
            $typeId = $this->variantModel->createVariantType($data['name']);
            $type = $this->variantModel->getVariantTypeById($typeId);
            Response::success($type, 'Variant type created successfully', 201);
        } catch (Exception $e) {
            error_log('Create variant type error: ' . $e->getMessage());
            Response::error('Failed to create variant type', 500);
        }
    }

    /**
     * Create a new variant option
     */
    public function createVariantOption() {
        $user = AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['variant_type_id']) || !isset($data['value'])) {
            Response::error('Missing required fields: variant_type_id, value', 400);
        }

        try {
            $optionId = $this->variantModel->createVariantOption($data['variant_type_id'], $data['value']);
            $option = $this->variantModel->getVariantOptionById($optionId);
            Response::success($option, 'Variant option created successfully', 201);
        } catch (Exception $e) {
            error_log('Create variant option error: ' . $e->getMessage());
            Response::error('Failed to create variant option', 500);
        }
    }
}
