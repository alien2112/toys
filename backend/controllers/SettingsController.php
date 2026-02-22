<?php

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class SettingsController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getSettings() {
        try {
            $stmt = $this->db->prepare("SELECT setting_key, setting_value FROM settings");
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $settings = [];
            foreach ($results as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
            
            Response::success($settings);
        } catch (Exception $e) {
            Response::error('Failed to fetch settings', 500);
        }
    }

    public function updateSettings() {
        // Require admin authentication
        AuthMiddleware::requireAdmin();
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !is_array($data)) {
                Response::error('Invalid data format', 400);
                return;
            }

            $this->db->beginTransaction();

            foreach ($data as $key => $value) {
                $stmt = $this->db->prepare(
                    "INSERT INTO settings (setting_key, setting_value) 
                     VALUES (:key, :value) 
                     ON DUPLICATE KEY UPDATE setting_value = :value"
                );
                $stmt->execute([
                    ':key' => $key,
                    ':value' => $value
                ]);
            }

            $this->db->commit();
            Response::success(['message' => 'Settings updated successfully']);
        } catch (Exception $e) {
            $this->db->rollBack();
            Response::error('Failed to update settings: ' . $e->getMessage(), 500);
        }
    }
}
