<?php

require_once __DIR__ . '/../utils/Database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($email, $password, $firstName, $lastName, $role = 'user') {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $this->db->prepare(
            "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)"
        );
        
        $stmt->execute([$email, $hashedPassword, $firstName, $lastName, $role]);
        
        return $this->db->lastInsertId();
    }

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function verifyPassword($password, $hashedPassword) {
        return password_verify($password, $hashedPassword);
    }
}
