<?php

// Test API endpoints using file_get_contents
$baseUrl = 'http://localhost:8000/api';

$endpoints = [
    '/products/featured?limit=1',
    '/settings',
    '/categories',
    '/products?page=1&limit=1'
];

foreach ($endpoints as $endpoint) {
    $url = $baseUrl . $endpoint;
    echo "Testing: $endpoint\n";

    $options = [
        'http' => [
            'method' => 'GET',
            'ignore_errors' => true,
            'header' => "User-Agent: TestScript/1.0\r\n"
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    $httpCode = 0;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('#^HTTP/\d+\.\d+\s+(\d+)#', $header, $matches)) {
                $httpCode = (int)$matches[1];
                break;
            }
        }
    }

    echo "HTTP Code: $httpCode\n";

    if ($httpCode === 500) {
        echo "❌ 500 Error detected\n";
        // Show first 200 chars of response to see error details
        if ($response !== false) {
            echo "Response preview: " . substr($response, 0, 200) . "\n";
        }
    } else {
        echo "✅ Success\n";
    }

    echo "---\n";
}

?>
