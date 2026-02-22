<?php

require_once __DIR__ . '/utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Check if user exists
    $check = $db->prepare('SELECT id, email, role FROM users WHERE email = ?');
    $check->execute(['test@gmail.com']);
    $existingUser = $check->fetch(PDO::FETCH_ASSOC);
    
    if ($existingUser) {
        // User exists, update to admin
        $stmt = $db->prepare('UPDATE users SET role = ? WHERE email = ?');
        $stmt->execute(['admin', 'test@gmail.com']);
        
        echo "✅ Successfully updated test@gmail.com to admin role\n\n";
    } else {
        // User doesn't exist, create new admin user
        // Password: "password" (same as default users)
        $hashedPassword = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        
        $stmt = $db->prepare('INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute(['test@gmail.com', $hashedPassword, 'Test', 'Admin', 'admin']);
        
        echo "✅ Successfully created new admin user: test@gmail.com\n";
        echo "   Default password: password\n\n";
    }
    
    // Verify the result
    $verify = $db->prepare('SELECT id, email, first_name, last_name, role, created_at FROM users WHERE email = ?');
    $verify->execute(['test@gmail.com']);
    $user = $verify->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "User Details:\n";
        echo "  ID: " . $user['id'] . "\n";
        echo "  Email: " . $user['email'] . "\n";
        echo "  Name: " . $user['first_name'] . " " . $user['last_name'] . "\n";
        echo "  Role: " . $user['role'] . "\n";
        echo "  Created: " . $user['created_at'] . "\n\n";
        echo "You can now login at /admin/login with:\n";
        echo "  Email: test@gmail.com\n";
        echo "  Password: password\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
