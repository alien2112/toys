<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Database.php';

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     required={"id", "email", "first_name", "last_name"},
 *     @OA\Property(property="id", type="integer", description="User ID"),
 *     @OA\Property(property="email", type="string", format="email", description="User email"),
 *     @OA\Property(property="first_name", type="string", description="User first name"),
 *     @OA\Property(property="last_name", type="string", description="User last name"),
 *     @OA\Property(property="role", type="string", enum={"user", "admin"}, description="User role"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Creation timestamp"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Last update timestamp")
 * )
 *
 * @OA\Schema(
 *     schema="RegisterRequest",
 *     type="object",
 *     required={"email", "password", "first_name", "last_name"},
 *     @OA\Property(property="email", type="string", format="email", description="User email address"),
 *     @OA\Property(property="password", type="string", format="password", minLength=8, description="User password (minimum 8 characters)"),
 *     @OA\Property(property="first_name", type="string", description="User first name"),
 *     @OA\Property(property="last_name", type="string", description="User last name")
 * )
 *
 * @OA\Schema(
 *     schema="LoginRequest",
 *     type="object",
 *     required={"email", "password"},
 *     @OA\Property(property="email", type="string", format="email", description="User email address"),
 *     @OA\Property(property="password", type="string", format="password", description="User password")
 * )
 *
 * @OA\Schema(
 *     schema="AuthResponse",
 *     type="object",
 *     @OA\Property(property="success", type="boolean", example=true),
 *     @OA\Property(property="message", type="string", example="Login successful"),
 *     @OA\Property(property="data", type="object",
 *         @OA\Property(property="user", ref="#/components/schemas/User"),
 *         @OA\Property(property="token", type="string", description="JWT authentication token")
 *     )
 * )
 */

class AuthController {
    private $userModel;
    private $db;

    public function __construct() {
        $this->userModel = new User();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * @OA\Post(
     *     path="/register",
     *     summary="Register a new user",
     *     description="Creates a new user account with email, password, and personal information",
     *     operationId="registerUser",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/RegisterRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(ref="#/components/schemas/AuthResponse")
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input data",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Missing required fields")
     *         )
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="Email already exists",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Email already exists")
     *         )
     *     ),
     *     @OA\Response(
     *         response=429,
     *         description="Too many requests - rate limited",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Too many requests")
     *         )
     *     )
     * )
     */
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
