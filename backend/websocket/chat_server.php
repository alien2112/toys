<?php

// Simple WebSocket chat server using PHP sockets
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/Database.php';

class ChatWebSocketServer {
    private $masterSocket;
    private $clients = [];
    private $sessions = [];
    private $db;

    public function __construct($host = 'localhost', $port = 8080) {
        $this->db = Database::getInstance()->getConnection();
        
        // Create master socket
        $this->masterSocket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
        socket_set_option($this->masterSocket, SOL_SOCKET, SO_REUSEADDR, 1);
        socket_bind($this->masterSocket, $host, $port);
        socket_listen($this->masterSocket);
        
        echo "WebSocket chat server running on $host:$port\n";
        $this->clients[] = $this->masterSocket;
    }

    public function run() {
        while (true) {
            $read = $this->clients;
            $write = $except = null;
            
            // Select sockets with activity
            if (socket_select($read, $write, $except, null) < 1) {
                continue;
            }

            // Handle new connections
            if (in_array($this->masterSocket, $read)) {
                $newClient = socket_accept($this->masterSocket);
                $this->handleNewConnection($newClient);
                $this->clients[] = $newClient;
            }

            // Handle client messages
            foreach ($this->clients as $client) {
                if ($client == $this->masterSocket) continue;
                
                if (in_array($client, $read)) {
                    $data = socket_read($client, 2048);
                    if ($data === false) {
                        $this->handleDisconnect($client);
                        continue;
                    }
                    
                    $this->handleMessage($client, $data);
                }
            }
        }
    }

    private function handleNewConnection($client) {
        // Perform WebSocket handshake
        $headers = socket_read($client, 2048);
        
        if (strpos($headers, 'Upgrade: websocket') === false) {
            socket_close($client);
            return;
        }

        // Extract WebSocket key
        preg_match('/Sec-WebSocket-Key: (.*)\r\n/', $headers, $matches);
        $key = trim($matches[1]);
        
        // Generate accept key
        $acceptKey = base64_encode(pack('H*', sha1($key . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        
        // Send handshake response
        $response = "HTTP/1.1 101 Switching Protocols\r\n" .
                   "Upgrade: websocket\r\n" .
                   "Connection: Upgrade\r\n" .
                   "Sec-WebSocket-Accept: $acceptKey\r\n\r\n";
        
        socket_write($client, $response);
        
        echo "New WebSocket connection established\n";
    }

    private function handleMessage($client, $data) {
        // Decode WebSocket frame
        $decoded = $this->decodeWebSocketFrame($data);
        
        if ($decoded === false) {
            return;
        }

        $message = json_decode($decoded, true);
        
        if (!$message || !isset($message['type'])) {
            return;
        }

        switch ($message['type']) {
            case 'join_session':
                $this->handleJoinSession($client, $message);
                break;
            case 'chat_message':
                $this->handleChatMessage($client, $message);
                break;
            case 'typing':
                $this->handleTyping($client, $message);
                break;
        }
    }

    private function handleJoinSession($client, $message) {
        $sessionId = $message['session_id'] ?? null;
        $userId = $message['user_id'] ?? null;
        $isAgent = $message['is_agent'] ?? false;
        
        if (!$sessionId) {
            $this->sendToClient($client, [
                'type' => 'error',
                'message' => 'Session ID required'
            ]);
            return;
        }

        // Verify session exists
        $stmt = $this->db->prepare(
            "SELECT cs.*, u.first_name, u.last_name 
             FROM chat_sessions cs
             LEFT JOIN users u ON cs.user_id = u.id
             WHERE cs.session_id = ? AND cs.status = 'active'"
        );
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();

        if (!$session) {
            $this->sendToClient($client, [
                'type' => 'error',
                'message' => 'Invalid session'
            ]);
            return;
        }

        // Store client session info
        $clientId = (int)$client;
        $this->sessions[$clientId] = [
            'session_id' => $sessionId,
            'user_id' => $userId,
            'is_agent' => $isAgent,
            'session_data' => $session
        ];

        // Send recent messages
        $messages = $this->getRecentMessages($session['id']);
        
        $this->sendToClient($client, [
            'type' => 'session_joined',
            'session' => $session,
            'messages' => $messages
        ]);

        // Notify others
        $this->broadcastToSession($sessionId, [
            'type' => 'user_joined',
            'user_info' => [
                'name' => $session['first_name'] ? 
                    $session['first_name'] . ' ' . ($session['last_name'] ?? '') : 
                    'Guest',
                'is_agent' => $isAgent
            ]
        ], $client);
    }

    private function handleChatMessage($client, $message) {
        $clientId = (int)$client;
        $sessionInfo = $this->sessions[$clientId] ?? null;
        
        if (!$sessionInfo) {
            return;
        }

        $sessionId = $sessionInfo['session_id'];
        $msgText = $message['message'] ?? '';
        
        if (empty(trim($msgText))) {
            return;
        }

        // Get session database ID
        $stmt = $this->db->prepare("SELECT id FROM chat_sessions WHERE session_id = ?");
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();

        if (!$session) {
            return;
        }

        // Save message
        $senderType = $sessionInfo['is_agent'] ? 'agent' : 'user';
        $stmt = $this->db->prepare(
            "INSERT INTO chat_messages (session_id, sender_type, sender_id, message) 
             VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$session['id'], $senderType, $sessionInfo['user_id'], $msgText]);
        $messageId = $this->db->lastInsertId();

        // Get saved message with sender info
        $stmt = $this->db->prepare(
            "SELECT cm.*, u.first_name, u.last_name 
             FROM chat_messages cm
             LEFT JOIN users u ON cm.sender_id = u.id
             WHERE cm.id = ?"
        );
        $stmt->execute([$messageId]);
        $savedMessage = $stmt->fetch();

        // Broadcast to session
        $this->broadcastToSession($sessionId, [
            'type' => 'new_message',
            'message' => $savedMessage
        ]);
    }

    private function handleTyping($client, $message) {
        $clientId = (int)$client;
        $sessionInfo = $this->sessions[$clientId] ?? null;
        
        if (!$sessionInfo) {
            return;
        }

        $this->broadcastToSession($sessionInfo['session_id'], [
            'type' => 'typing_status',
            'typing' => $message['typing'] ?? false
        ], $client);
    }

    private function handleDisconnect($client) {
        $clientId = (int)$client;
        $sessionInfo = $this->sessions[$clientId] ?? null;
        
        if ($sessionInfo) {
            $this->broadcastToSession($sessionInfo['session_id'], [
                'type' => 'user_left'
            ], $client);
            
            unset($this->sessions[$clientId]);
        }

        // Remove from clients list
        $key = array_search($client, $this->clients);
        if ($key !== false) {
            unset($this->clients[$key]);
        }
        
        socket_close($client);
        echo "Client disconnected\n";
    }

    private function getRecentMessages($sessionId) {
        $stmt = $this->db->prepare(
            "SELECT cm.*, u.first_name, u.last_name 
             FROM chat_messages cm
             LEFT JOIN users u ON cm.sender_id = u.id
             WHERE cm.session_id = ?
             ORDER BY cm.created_at ASC
             LIMIT 50"
        );
        $stmt->execute([$sessionId]);
        return $stmt->fetchAll();
    }

    private function broadcastToSession($sessionId, $data, $excludeClient = null) {
        foreach ($this->sessions as $clientId => $sessionInfo) {
            if ($sessionInfo['session_id'] !== $sessionId) {
                continue;
            }
            
            $client = $this->findClientById($clientId);
            if ($client && $client !== $excludeClient) {
                $this->sendToClient($client, $data);
            }
        }
    }

    private function findClientById($clientId) {
        foreach ($this->clients as $client) {
            if ((int)$client === $clientId) {
                return $client;
            }
        }
        return null;
    }

    private function sendToClient($client, $data) {
        $json = json_encode($data);
        $encoded = $this->encodeWebSocketFrame($json);
        socket_write($client, $encoded);
    }

    private function decodeWebSocketFrame($data) {
        if (strlen($data) < 2) {
            return false;
        }

        $secondByte = ord($data[1]);
        $masked = ($secondByte & 0x80) !== 0;
        $payloadLen = $secondByte & 0x7F;

        $offset = 2;
        
        // Extended payload length
        if ($payloadLen === 126) {
            if (strlen($data) < 4) return false;
            $payloadLen = (ord($data[2]) << 8) | ord($data[3]);
            $offset = 4;
        } elseif ($payloadLen === 127) {
            if (strlen($data) < 10) return false;
            $payloadLen = (ord($data[2]) << 56) | (ord($data[3]) << 48) | 
                        (ord($data[4]) << 40) | (ord($data[5]) << 32) | 
                        (ord($data[6]) << 24) | (ord($data[7]) << 16) | 
                        (ord($data[8]) << 8) | ord($data[9]);
            $offset = 10;
        }

        // Masking key
        $maskingKey = '';
        if ($masked) {
            if (strlen($data) < $offset + 4) return false;
            $maskingKey = substr($data, $offset, 4);
            $offset += 4;
        }

        // Payload
        if (strlen($data) < $offset + $payloadLen) {
            return false;
        }
        
        $payload = substr($data, $offset, $payloadLen);
        
        // Unmask payload if needed
        if ($masked) {
            $unmasked = '';
            for ($i = 0; $i < $payloadLen; $i++) {
                $unmasked .= $payload[$i] ^ $maskingKey[$i % 4];
            }
            $payload = $unmasked;
        }

        return $payload;
    }

    private function encodeWebSocketFrame($data) {
        $payload = $data;
        $payloadLen = strlen($payload);
        
        $frame = "\x81"; // FIN=1, opcode=text
        
        if ($payloadLen < 126) {
            $frame .= chr($payloadLen);
        } elseif ($payloadLen < 65536) {
            $frame .= chr(126) . chr($payloadLen >> 8) . chr($payloadLen & 0xFF);
        } else {
            $frame .= chr(127) . 
                     chr(($payloadLen >> 56) & 0xFF) . chr(($payloadLen >> 48) & 0xFF) . 
                     chr(($payloadLen >> 40) & 0xFF) . chr(($payloadLen >> 32) & 0xFF) . 
                     chr(($payloadLen >> 24) & 0xFF) . chr(($payloadLen >> 16) & 0xFF) . 
                     chr(($payloadLen >> 8) & 0xFF) . chr($payloadLen & 0xFF);
        }
        
        $frame .= $payload;
        return $frame;
    }
}

// Start the server
$server = new ChatWebSocketServer();
$server->run();
