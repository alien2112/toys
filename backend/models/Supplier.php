<?php

class Supplier {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create new supplier
     */
    public function create($data) {
        $stmt = $this->db->prepare(
            "INSERT INTO suppliers (name, contact_person, email, phone, address, lead_time_days, min_order_quantity, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        return $stmt->execute([
            $data['name'],
            $data['contact_person'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['lead_time_days'] ?? 7,
            $data['min_order_quantity'] ?? 1,
            $data['notes'] ?? null
        ]);
    }

    /**
     * Get all suppliers
     */
    public function getAll($activeOnly = true) {
        $sql = "SELECT * FROM suppliers";
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY name ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Get supplier by ID
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM suppliers WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    /**
     * Update supplier
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];
        
        foreach (['name', 'contact_person', 'email', 'phone', 'address', 'lead_time_days', 'min_order_quantity', 'notes', 'is_active'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $sql = "UPDATE suppliers SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    /**
     * Delete supplier (soft delete)
     */
    public function delete($id) {
        $stmt = $this->db->prepare("UPDATE suppliers SET is_active = 0 WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Get supplier statistics
     */
    public function getStats($supplierId) {
        $stmt = $this->db->prepare(
            "SELECT 
                COUNT(DISTINCT po.id) as total_orders,
                SUM(po.total_amount) as total_spent,
                AVG(po.total_amount) as avg_order_value,
                COUNT(DISTINCT po.id) FILTER (WHERE po.status = 'delivered') as completed_orders
             FROM purchase_orders po
             WHERE po.supplier_id = ?"
        );
        $stmt->execute([$supplierId]);
        return $stmt->fetch();
    }

    /**
     * Search suppliers
     */
    public function search($query, $activeOnly = true) {
        $sql = "SELECT * FROM suppliers WHERE (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)";
        $params = ["%$query%", "%$query%", "%$query%"];
        
        if ($activeOnly) {
            $sql .= " AND is_active = 1";
        }
        
        $sql .= " ORDER BY name ASC LIMIT 20";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
