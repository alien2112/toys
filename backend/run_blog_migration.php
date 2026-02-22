<?php

require_once 'utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Read and execute the migration
    $migration = file_get_contents('migrations/004_create_blogs_table.sql');
    
    // Split by semicolons and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $migration)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            echo "Executing: " . substr($statement, 0, 50) . "...\n";
            $db->exec($statement);
        }
    }
    
    echo "Blog migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
}
