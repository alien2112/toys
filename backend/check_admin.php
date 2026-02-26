<?php

require_once __DIR__ . '/utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful\n";

    // Check if admin user exists
    $stmt = $db->prepare("SELECT id, email, first_name, role FROM users WHERE email = ?");
    $stmt->execute(['admin@toys.com']);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        echo "👤 Admin user found:\n";
        echo "   ID: {$admin['id']}\n";
        echo "   Email: {$admin['email']}\n";
        echo "   Name: {$admin['first_name']}\n";
        echo "   Role: {$admin['role']}\n";
        
        if ($admin['role'] !== 'admin') {
            echo "🔄 Updating role to admin...\n";
            $update = $db->prepare("UPDATE users SET role = 'admin' WHERE email = ?");
            $update->execute(['admin@toys.com']);
            echo "✅ Role updated to admin\n";
        }
        
        // Reset password
        echo "🔑 Resetting password to 'admin123'...\n";
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $update = $db->prepare("UPDATE users SET password = ? WHERE email = ?");
        $update->execute([$hashedPassword, 'admin@toys.com']);
        echo "✅ Password reset successfully\n";
        
    } else {
        echo "❌ Admin user not found. Creating new admin user...\n";
        
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("
            INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) 
            VALUES (?, ?, 'Admin', 'User', 'admin', NOW(), NOW())
        ");
        
        $stmt->execute(['admin@toys.com', $hashedPassword]);
        
        echo "✅ Admin user created successfully!\n";
        echo "📧 Email: admin@toys.com\n";
        echo "🔑 Password: admin123\n";
    }

    // Test login credentials
    echo "\n🔐 Testing login credentials...\n";
    $stmt = $db->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->execute(['admin@toys.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify('admin123', $user['password'])) {
        echo "✅ Login credentials are valid!\n";
        echo "👤 User ID: {$user['id']}\n";
        echo "📧 Email: {$user['email']}\n";
        echo "🔐 Role: {$user['role']}\n";
    } else {
        echo "❌ Login credentials verification failed\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

?>
