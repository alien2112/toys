<?php

// Test database connection
require_once __DIR__ . '/utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful\n";

    // Test if database exists
    $stmt = $db->query("SELECT DATABASE() as current_db");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "📊 Current database: " . ($result['current_db'] ?: 'none') . "\n";

    // Check if tables exist
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "📋 Tables found: " . count($tables) . "\n";

    if (count($tables) > 0) {
        echo "Tables: " . implode(', ', $tables) . "\n";
    } else {
        echo "❌ No tables found - migrations may not have been run\n";
    }

} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    echo "🔍 Error code: " . $e->getCode() . "\n";
}

?>
