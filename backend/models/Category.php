<?php

require_once __DIR__ . '/../utils/Database.php';

class Category {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM categories ORDER BY name");
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getBySlug($slug) {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch();
    }

    public function create($name, $slug, $description = null) {
        $stmt = $this->db->prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)");
        return $stmt->execute([$name, $slug, $description]);
    }

    public function update($id, $name, $slug, $description = null) {
        $stmt = $this->db->prepare("UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?");
        return $stmt->execute([$name, $slug, $description, $id]);
    }

    public function delete($id) {
        // Check if category has products
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            return false; // Cannot delete category with products
        }

        $stmt = $this->db->prepare("DELETE FROM categories WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getProductCount($id) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return (int)$result['count'];
    }

    public function search($query) {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE name LIKE ? OR description LIKE ? ORDER BY name");
        $searchTerm = "%{$query}%";
        $stmt->execute([$searchTerm, $searchTerm]);
        return $stmt->fetchAll();
    }
}
