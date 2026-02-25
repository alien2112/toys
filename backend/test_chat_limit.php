<?php

// Test the chat message limit system
require_once __DIR__ . '/controllers/ChatController.php';
require_once __DIR__ . '/utils/Database.php';

echo "🧪 Testing Chat Message Limit System\n";
echo "===================================\n\n";

// Create a test session for anonymous user
$chatController = new ChatController();
$chatModel = new Chat(); // We'll need direct access to the model for testing

// Simulate anonymous user IP
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'TestBrowser/1.0';

// Test 1: Create anonymous session
echo "Test 1: Creating anonymous chat session...\n";
ob_start();
$chatController->createSession();
$response = ob_get_clean();
$responseData = json_decode($response, true);

if (isset($responseData['data']['session_id'])) {
    $sessionId = $responseData['data']['session_id'];
    echo "✅ Session created: $sessionId\n\n";

    // Test 2: Send messages up to the limit
    echo "Test 2: Testing message limit (3 messages max for anonymous users)...\n";

    for ($i = 1; $i <= 5; $i++) {
        echo "Sending message $i: ";

        // Simulate POST request
        $_POST = ['message' => "Test message $i"];
        $GLOBALS['HTTP_RAW_POST_DATA'] = json_encode(['message' => "Test message $i"]);

        ob_start();
        try {
            $chatController->sendMessage($sessionId);
            $result = ob_get_clean();
            $resultData = json_decode($result, true);

            if (isset($resultData['success']) && $resultData['success']) {
                echo "✅ SUCCESS\n";
            } else {
                echo "❌ FAILED: " . ($resultData['message'] ?? 'Unknown error') . "\n";
                if (isset($resultData['data']['requires_login']) && $resultData['data']['requires_login']) {
                    echo "   ℹ️  Login required after 3 messages (as expected)\n";
                }
            }
        } catch (Exception $e) {
            echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
            ob_end_clean();
        }
    }

    echo "\nTest 3: Verifying message count...\n";
    $messageCount = $chatModel->getUserMessageCount($sessionId);
    echo "Total user messages in session: $messageCount\n";
    echo $messageCount === 3 ? "✅ Correctly limited to 3 messages\n" : "❌ Incorrect message count\n";

} else {
    echo "❌ Failed to create session\n";
    echo "Response: $response\n";
}

echo "\n🎯 Chat Limitation Test Complete!\n";
