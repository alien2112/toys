#!/bin/bash

# WebSocket Server Startup Script

echo "Starting WebSocket Chat Server..."

# Navigate to the websocket directory
cd /home/alien/Desktop/TOYS/backend/websocket

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed or not in PATH"
    exit 1
fi

# Start the WebSocket server
echo "Starting server on localhost:8080"
php chat_server.php

echo "WebSocket server stopped"
