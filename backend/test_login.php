<?php

// Test login endpoint
$url = 'http://localhost:8080/api/login';
$data = [
    'email' => 'admin@toys.com',
    'password' => 'admin123'
];

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

echo "🔐 Testing login endpoint...\n";
echo "📡 URL: {$url}\n";
echo "📧 Email: {$data['email']}\n";
echo "🔑 Password: {$data['password']}\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

if ($curlError) {
    echo "❌ cURL Error: {$curlError}\n";
} else {
    echo "📊 HTTP Status: {$httpCode}\n";
    echo "📄 Response:\n{$response}\n\n";
    
    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['success'])) {
        if ($responseData['success']) {
            echo "✅ Login successful!\n";
            if (isset($responseData['token'])) {
                echo "🎫 Token: " . substr($responseData['token'], 0, 50) . "...\n";
            }
            if (isset($responseData['user'])) {
                echo "👤 User: {$responseData['user']['email']} ({$responseData['user']['role']})\n";
            }
        } else {
            echo "❌ Login failed: {$responseData['message']}\n";
        }
    } else {
        echo "⚠️ Invalid JSON response\n";
    }
}

?>
