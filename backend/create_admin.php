<?php

require_once __DIR__ . '/utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Create admin user with password "admin123"
    $email = 'admin@toys.com';
    $password = 'admin123';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Check if admin exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        echo "Admin user already exists. Updating password...\n";
        $stmt = $db->prepare("UPDATE users SET password = ?, role = 'admin' WHERE email = ?");
        $stmt->execute([$hashedPassword, $email]);
    } else {
        echo "Creating new admin user...\n";
        $stmt = $db->prepare("
            INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) 
            VALUES (?, ?, 'Admin', 'User', 'admin', NOW(), NOW())
        ");
        $stmt->execute([$email, $hashedPassword]);
    }
    
    echo "✅ Admin user created successfully!\n";
    echo "📧 Email: {$email}\n";
    echo "🔑 Password: {$password}\n";
    echo "🌐 Login URL: http://localhost:5173/login\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
