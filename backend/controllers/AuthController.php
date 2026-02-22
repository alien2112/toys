<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Database.php';

class AuthController {
    private $userModel;
    private $db;

    public function __construct() {
        $this->userModel = new User();
        $this->db = Database::getInstance()->getConnection();
    }

    public function register() {
        // Rate limiting
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        RateLimiter::check('register_' . $ip, 5, 15); // 5 attempts per 15 minutes

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password']) || !isset($data['first_name']) || !isset($data['last_name'])) {
            Response::error('Missing required fields', 400);
        }

        // Validate and sanitize inputs
        $email = Validator::sanitizeString($data['email']);
        $firstName = Validator::sanitizeString($data['first_name']);
        $lastName = Validator::sanitizeString($data['last_name']);

        if (!Validator::email($email)) {
            Response::error('Invalid email format', 400);
        }

        if (!Validator::strongPassword($data['password'])) {
            Response::error('Password must be at least 8 characters and contain uppercase, lowercase, and numbers', 400);
        }

        if (!Validator::required($firstName) || !Validator::required($lastName)) {
            Response::error('First name and last name are required', 400);
        }

        if ($this->userModel->findByEmail($email)) {
            Response::error('Email already exists', 409);
        }

        try {
            $userId = $this->userModel->create(
                $email,
                $data['password'],
                $firstName,
                $lastName
            );

            $user = $this->userModel->findById($userId);
            $token = JWT::encode([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role']
            ]);

            Response::success([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'role' => $user['role']
                ]
            ], 'Registration successful', 201);
        } catch (Exception $e) {
            Response::error('Registration failed', 500);
        }
    }

    public function login() {
        // Rate limiting
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        RateLimiter::check('login_' . $ip, 10, 5); // 10 attempts per 5 minutes

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            Response::error('Email and password are required', 400);
        }

        $email = Validator::sanitizeString($data['email']);

        if (!Validator::email($email)) {
            Response::error('Invalid email format', 400);
        }

        $user = $this->userModel->findByEmail($email);

        if (!$user || !$this->userModel->verifyPassword($data['password'], $user['password'])) {
            Response::error('Invalid credentials', 401);
        }

        $token = JWT::encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role']
            ]
        ], 'Login successful');
    }

    public function getMe() {
        $payload = AuthMiddleware::authenticate();
        $userId = $payload['user_id'];

        $stmt = $this->db->prepare("SELECT id, email, first_name, last_name, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::error('User not found', 404);
        }

        Response::success(['user' => $user], 'OK');
    }
}
