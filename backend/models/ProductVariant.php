<?php

require_once __DIR__ . '/../utils/Database.php';

class ProductVariant {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all variants for a product
     */
    public function getByProductId($productId) {
        $stmt = $this->db->prepare("
            SELECT pv.*, 
                   GROUP_CONCAT(DISTINCT CONCAT(vo.variant_type_id, ':', vo.id) ORDER BY vo.variant_type_id) as variant_options
            FROM product_variants pv
            LEFT JOIN product_variant_options pvo ON pv.id = pvo.variant_id
            LEFT JOIN variant_options vo ON pvo.variant_option_id = vo.id
            WHERE pv.product_id = ? AND pv.is_active = 1
            GROUP BY pv.id
            ORDER BY pv.created_at
        ");
        
        $stmt->execute([$productId]);
        $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format variant options
        foreach ($variants as &$variant) {
            $variant['variant_options'] = $this->getVariantOptionsForVariant($variant['id']);
        }
        
        return $variants;
    }

    /**
     * Get variant by ID with full details
     */
    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT pv.*, p.name as product_name, p.slug as product_slug
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.id
            WHERE pv.id = ?
        ");
        
        $stmt->execute([$id]);
        $variant = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($variant) {
            $variant['variant_options'] = $this->getVariantOptionsForVariant($id);
        }
        
        return $variant;
    }

    /**
     * Get variant options for a specific variant
     */
    public function getVariantOptionsForVariant($variantId) {
        $stmt = $this->db->prepare("
            SELECT vo.*, vt.name as type_name, vt.slug as type_slug
            FROM variant_options vo
            JOIN product_variant_options pvo ON vo.id = pvo.variant_option_id
            JOIN variant_types vt ON vo.variant_type_id = vt.id
            WHERE pvo.variant_id = ?
            ORDER BY vt.name, vo.value
        ");
        
        $stmt->execute([$variantId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new variant
     */
    public function create($productId, $sku, $price, $stock = 0, $imageUrl = null, $isActive = true) {
        $stmt = $this->db->prepare("
            INSERT INTO product_variants (product_id, sku, price, stock, image_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([$productId, $sku, $price, $stock, $imageUrl, $isActive]);
        return $this->db->lastInsertId();
    }

    /**
     * Update a variant
     */
    public function update($id, $sku, $price, $stock = 0, $imageUrl = null, $isActive = true) {
        $stmt = $this->db->prepare("
            UPDATE product_variants 
            SET sku = ?, price = ?, stock = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        return $stmt->execute([$sku, $price, $stock, $imageUrl, $isActive, $id]);
    }

    /**
     * Delete a variant
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM product_variants WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Add variant option to a variant
     */
    public function addVariantOption($variantId, $optionId) {
        $stmt = $this->db->prepare("
            INSERT IGNORE INTO product_variant_options (variant_id, variant_option_id)
            VALUES (?, ?)
        ");
        
        return $stmt->execute([$variantId, $optionId]);
    }

    /**
     * Remove all variant options for a variant
     */
    public function removeAllVariantOptions($variantId) {
        $stmt = $this->db->prepare("DELETE FROM product_variant_options WHERE variant_id = ?");
        return $stmt->execute([$variantId]);
    }

    /**
     * Check if SKU is unique
     */
    public function isSkuUnique($sku, $excludeId = null) {
        $sql = "SELECT id FROM product_variants WHERE sku = ?";
        $params = [$sku];
        
        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->rowCount() === 0;
    }

    /**
     * Update product has_variants flag
     */
    public function updateProductHasVariants($productId, $hasVariants) {
        $stmt = $this->db->prepare("
            UPDATE products 
            SET has_variants = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        return $stmt->execute([$hasVariants, $productId]);
    }

    /**
     * Get all variant types
     */
    public function getVariantTypes() {
        $stmt = $this->db->prepare("
            SELECT vt.*, 
                   (SELECT COUNT(*) FROM variant_options WHERE variant_type_id = vt.id) as options_count
            FROM variant_types vt
            ORDER BY vt.name
        ");
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get variant type by ID
     */
    public function getVariantTypeById($id) {
        $stmt = $this->db->prepare("SELECT * FROM variant_types WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get variant options by type
     */
    public function getVariantOptionsByType($typeId) {
        $stmt = $this->db->prepare("
            SELECT vo.* 
            FROM variant_options vo
            WHERE vo.variant_type_id = ?
            ORDER BY vo.value
        ");
        
        $stmt->execute([$typeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get variant option by ID
     */
    public function getVariantOptionById($id) {
        $stmt = $this->db->prepare("
            SELECT vo.*, vt.name as type_name
            FROM variant_options vo
            JOIN variant_types vt ON vo.variant_type_id = vt.id
            WHERE vo.id = ?
        ");
        
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new variant type
     */
    public function createVariantType($name) {
        // Generate slug
        $slug = $this->generateSlug($name);
        
        $stmt = $this->db->prepare("
            INSERT INTO variant_types (name, slug)
            VALUES (?, ?)
        ");
        
        $stmt->execute([$name, $slug]);
        return $this->db->lastInsertId();
    }

    /**
     * Create a new variant option
     */
    public function createVariantOption($variantTypeId, $value) {
        // Generate slug
        $slug = $this->generateSlug($value);
        
        $stmt = $this->db->prepare("
            INSERT INTO variant_options (variant_type_id, value, slug)
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([$variantTypeId, $value, $slug]);
        return $this->db->lastInsertId();
    }

    /**
     * Generate slug from text
     */
    private function generateSlug($text) {
        // Convert to lowercase and replace spaces with hyphens
        $slug = strtolower($text);
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/\s+/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }

    /**
     * Get variant with full details for cart/order
     */
    public function getVariantForCart($variantId) {
        $stmt = $this->db->prepare("
            SELECT pv.*, p.name as product_name, p.slug as product_slug,
                   GROUP_CONCAT(DISTINCT CONCAT(vt.name, ':', vo.value) ORDER BY vt.name SEPARATOR ', ') as variant_attributes
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.id
            LEFT JOIN product_variant_options pvo ON pv.id = pvo.variant_id
            LEFT JOIN variant_options vo ON pvo.variant_option_id = vo.id
            LEFT JOIN variant_types vt ON vo.variant_type_id = vt.id
            WHERE pv.id = ? AND pv.is_active = 1
            GROUP BY pv.id
        ");
        
        $stmt->execute([$variantId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update stock for a variant
     */
    public function updateStock($variantId, $newStock) {
        $stmt = $this->db->prepare("
            UPDATE product_variants 
            SET stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        return $stmt->execute([$newStock, $variantId]);
    }

    /**
     * Decrease stock (for orders)
     */
    public function decreaseStock($variantId, $quantity) {
        $stmt = $this->db->prepare("
            UPDATE product_variants 
            SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND stock >= ?
        ");
        
        return $stmt->execute([$quantity, $variantId, $quantity]);
    }

    /**
     * Increase stock (for returns/cancellations)
     */
    public function increaseStock($variantId, $quantity) {
        $stmt = $this->db->prepare("
            UPDATE product_variants 
            SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        return $stmt->execute([$quantity, $variantId]);
    }
}
