<?php

require_once __DIR__ . '/utils/Database.php';
require_once __DIR__ . '/seed_excel_data.php';

class UserSeeder {
    private $db;
    private $parser;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->parser = new ExcelDataParser();
    }
    
    public function seedUsers() {
        echo "👥 Starting user seeding...\n\n";
        
        try {
            // Get user data
            $userData = $this->parser->parseExcelFile('المواليد محدث (1).xlsx');
            
            if (empty($userData['users'])) {
                echo "❌ No user data found\n";
                return;
            }
            
            $insertedCount = 0;
            $updatedCount = 0;
            
            foreach ($userData['users'] as $user) {
                // Check if user exists by email
                $existingUser = $this->getUserByEmail($user['email']);
                
                if ($existingUser) {
                    // Update existing user
                    $this->updateUser($user);
                    echo "🔄 Updated user: {$user['email']}\n";
                    $updatedCount++;
                } else {
                    // Insert new user
                    $userId = $this->insertUser($user);
                    echo "✅ Inserted user: {$user['email']} (ID: {$userId})\n";
                    $insertedCount++;
                }
            }
            
            echo "\n📊 User Seeding Summary:\n";
            echo "   ✅ Inserted: {$insertedCount} new users\n";
            echo "   🔄 Updated: {$updatedCount} existing users\n";
            echo "   👥 Total processed: " . ($insertedCount + $updatedCount) . " users\n";
            
        } catch (Exception $e) {
            echo "❌ Error seeding users: " . $e->getMessage() . "\n";
        }
    }
    
    private function getUserByEmail($email) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function insertUser($user) {
        $hashedPassword = password_hash($user['password'], PASSWORD_DEFAULT);
        
        $stmt = $this->db->prepare("
            INSERT INTO users (
                email, password, first_name, last_name, role, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'user', NOW(), NOW())
        ");
        
        $stmt->execute([
            $user['email'],
            $hashedPassword,
            $user['first_name'],
            $user['last_name']
        ]);
        
        $userId = $this->db->lastInsertId();
        
        // Insert user profile data if we have a profile table
        $this->insertUserProfile($userId, $user);
        
        return $userId;
    }
    
    private function updateUser($user) {
        $stmt = $this->db->prepare("
            UPDATE users SET 
                first_name = ?, last_name = ?, updated_at = NOW()
            WHERE email = ?
        ");
        
        return $stmt->execute([
            $user['first_name'],
            $user['last_name'],
            $user['email']
        ]);
    }
    
    private function insertUserProfile($userId, $user) {
        // Check if user_profiles table exists
        $tableExists = $this->db->query("
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'user_profiles'
        ")->fetch(PDO::FETCH_ASSOC)['count'] > 0;
        
        if (!$tableExists) {
            // Create user_profiles table if it doesn't exist
            $this->createUserProfilesTable();
        }
        
        // Insert profile data
        $stmt = $this->db->prepare("
            INSERT INTO user_profiles (
                user_id, phone, address, birth_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                phone = VALUES(phone),
                address = VALUES(address),
                birth_date = VALUES(birth_date),
                updated_at = NOW()
        ");
        
        $stmt->execute([
            $userId,
            $user['phone'] ?? null,
            $user['address'] ?? null,
            $user['birth_date'] ?? null
        ]);
    }
    
    private function createUserProfilesTable() {
        echo "📋 Creating user_profiles table...\n";
        
        $sql = "
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                birth_date DATE,
                avatar_url VARCHAR(500),
                preferences JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        
        $this->db->exec($sql);
        echo "✅ user_profiles table created\n";
    }
    
    public function clearAllUsers() {
        echo "🗑️  Clearing all users (except admin)...\n";
        
        // Check if user_profiles table exists before clearing it
        $tableExists = $this->db->query("
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'user_profiles'
        ")->fetch(PDO::FETCH_ASSOC)['count'] > 0;
        
        if ($tableExists) {
            // Clear user profiles
            $this->db->exec("DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM users WHERE role = 'admin')");
        }
        
        // Clear cart items for non-admin users
        $this->db->exec("DELETE FROM cart WHERE user_id NOT IN (SELECT id FROM users WHERE role = 'admin')");
        
        // Clear orders for non-admin users
        $this->db->exec("DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users WHERE role = 'admin')");
        
        // Clear reviews by non-admin users
        $this->db->exec("DELETE FROM reviews WHERE user_id NOT IN (SELECT id FROM users WHERE role = 'admin')");
        
        // Clear non-admin users
        $result = $this->db->exec("DELETE FROM users WHERE role != 'admin'");
        
        echo "✅ Cleared {$result} non-admin users\n";
    }
    
    public function createSampleOrders() {
        echo "📦 Creating sample orders...\n";
        
        // Get some users and products
        $users = $this->db->query("SELECT id FROM users WHERE role = 'user' LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
        $products = $this->db->query("SELECT id, price FROM products WHERE is_active = TRUE LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($users) || empty($products)) {
            echo "⚠️  No users or products found for sample orders\n";
            return;
        }
        
        $orderCount = 0;
        
        foreach ($users as $user) {
            // Create 1-3 orders per user
            $numOrders = rand(1, 3);
            
            for ($i = 0; $i < $numOrders; $i++) {
                // Create order
                $orderStmt = $this->db->prepare("
                    INSERT INTO orders (user_id, total_amount, status, shipping_address, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NOW() - INTERVAL FLOOR(RAND() * 30) DAY, NOW())
                ");
                
                $shippingAddress = "عنوان شحن افتراضي للمستخدم {$user['id']}";
                $status = ['pending', 'processing', 'shipped', 'delivered'][rand(0, 3)];
                
                $orderStmt->execute([$user['id'], 0, $status, $shippingAddress]);
                $orderId = $this->db->lastInsertId();
                
                // Add 1-5 items to order
                $numItems = rand(1, 5);
                $totalAmount = 0;
                
                for ($j = 0; $j < $numItems; $j++) {
                    $product = $products[array_rand($products)];
                    $quantity = rand(1, 3);
                    $price = $product['price'];
                    $itemTotal = $price * $quantity;
                    $totalAmount += $itemTotal;
                    
                    $itemStmt = $this->db->prepare("
                        INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
                        VALUES (?, ?, ?, ?, NOW())
                    ");
                    
                    $itemStmt->execute([$orderId, $product['id'], $quantity, $price]);
                }
                
                // Update order total
                $updateStmt = $this->db->prepare("UPDATE orders SET total_amount = ? WHERE id = ?");
                $updateStmt->execute([$totalAmount, $orderId]);
                
                $orderCount++;
            }
        }
        
        echo "✅ Created {$orderCount} sample orders\n";
    }
}

// Run the seeder if called directly
if (php_sapi_name() === 'cli' && basename(__FILE__) === 'seed_users.php') {
    $seeder = new UserSeeder();
    
    if (isset($argv[1]) && $argv[1] === '--clear') {
        $seeder->clearAllUsers();
    }
    
    $seeder->seedUsers();
    
    if (isset($argv[2]) && $argv[2] === '--orders') {
        $seeder->createSampleOrders();
    }
}
