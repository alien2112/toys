<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/Database.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class ChatServer implements MessageComponentInterface {
    protected $clients;
    protected $db;
    protected $sessions; // Map connection_id => session_id
    protected $users; // Map session_id => connection_id

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->db = Database::getInstance()->getConnection();
        $this->sessions = [];
        $this->users = [];
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        
        if (!$data || !isset($data['type'])) {
            return;
        }

        switch ($data['type']) {
            case 'join_session':
                $this->handleJoinSession($from, $data);
                break;
            case 'chat_message':
                $this->handleChatMessage($from, $data);
                break;
            case 'agent_join':
                $this->handleAgentJoin($from, $data);
                break;
            case 'typing':
                $this->handleTyping($from, $data);
                break;
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        
        // Remove from sessions mapping
        $connectionId = $conn->resourceId;
        if (isset($this->sessions[$connectionId])) {
            $sessionId = $this->sessions[$connectionId];
            unset($this->users[$sessionId]);
            unset($this->sessions[$connectionId]);
            
            // Notify others that user left
            $this->broadcastToSession($sessionId, [
                'type' => 'user_left',
                'connection_id' => $connectionId
            ], $conn);
        }
        
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }

    private function handleJoinSession($conn, $data) {
        $sessionId = $data['session_id'] ?? null;
        $userId = $data['user_id'] ?? null;
        $isAgent = $data['is_agent'] ?? false;
        
        if (!$sessionId) {
            $conn->send(json_encode([
                'type' => 'error',
                'message' => 'Session ID required'
            ]));
            return;
        }

        // Verify session exists and is active
        $stmt = $this->db->prepare(
            "SELECT cs.*, u.first_name, u.last_name 
             FROM chat_sessions cs
             LEFT JOIN users u ON cs.user_id = u.id
             WHERE cs.session_id = ? AND cs.status = 'active'"
        );
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();

        if (!$session) {
            $conn->send(json_encode([
                'type' => 'error',
                'message' => 'Invalid session'
            ]));
            return;
        }

        // Add to mappings
        $connectionId = $conn->resourceId;
        $this->sessions[$connectionId] = $sessionId;
        $this->users[$sessionId][$connectionId] = $conn;

        // Send session info and recent messages
        $messages = $this->getRecentMessages($session['id']);
        
        $conn->send(json_encode([
            'type' => 'session_joined',
            'session' => $session,
            'messages' => $messages
        ]));

        // Notify others in session
        $this->broadcastToSession($sessionId, [
            'type' => 'user_joined',
            'user_info' => [
                'connection_id' => $connectionId,
                'is_agent' => $isAgent,
                'name' => $session['first_name'] ? 
                    "{$session['first_name']} {$session['last_name'] ?? ''}" : 
                    'Guest'
            ]
        ], $conn);

        // Update session status if agent joined
        if ($isAgent && !$session['assigned_agent']) {
            $stmt = $this->db->prepare(
                "UPDATE chat_sessions SET assigned_agent = ? WHERE id = ?"
            );
            $stmt->execute([$userId, $session['id']]);
        }
    }

    private function handleChatMessage($conn, $data) {
        $connectionId = $conn->resourceId;
        $sessionId = $this->sessions[$connectionId] ?? null;
        $message = $data['message'] ?? '';
        
        if (!$sessionId || empty(trim($message))) {
            return;
        }

        // Get session info
        $stmt = $this->db->prepare("SELECT id FROM chat_sessions WHERE session_id = ?");
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();

        if (!$session) {
            return;
        }

        // Determine sender type
        $isAgent = $data['is_agent'] ?? false;
        $senderType = $isAgent ? 'agent' : 'user';
        $senderId = $data['sender_id'] ?? null;

        // Save message to database
        $stmt = $this->db->prepare(
            "INSERT INTO chat_messages (session_id, sender_type, sender_id, message) 
             VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$session['id'], $senderType, $senderId, $message]);
        $messageId = $this->db->lastInsertId();

        // Get message with sender info
        $stmt = $this->db->prepare(
            "SELECT cm.*, u.first_name, u.last_name 
             FROM chat_messages cm
             LEFT JOIN users u ON cm.sender_id = u.id
             WHERE cm.id = ?"
        );
        $stmt->execute([$messageId]);
        $savedMessage = $stmt->fetch();

        // Broadcast to all in session
        $this->broadcastToSession($sessionId, [
            'type' => 'new_message',
            'message' => $savedMessage
        ]);
    }

    private function handleAgentJoin($conn, $data) {
        $sessionId = $data['session_id'] ?? null;
        $agentId = $data['agent_id'] ?? null;
        
        if (!$sessionId || !$agentId) {
            return;
        }

        // Update session with assigned agent
        $stmt = $this->db->prepare(
            "UPDATE chat_sessions SET assigned_agent = ? WHERE session_id = ?"
        );
        $stmt->execute([$agentId, $sessionId]);

        // Notify session
        $this->broadcastToSession($sessionId, [
            'type' => 'agent_assigned',
            'agent_id' => $agentId
        ]);
    }

    private function handleTyping($conn, $data) {
        $connectionId = $conn->resourceId;
        $sessionId = $this->sessions[$connectionId] ?? null;
        $isTyping = $data['typing'] ?? false;
        
        if (!$sessionId) {
            return;
        }

        // Broadcast typing status to others in session
        $this->broadcastToSession($sessionId, [
            'type' => 'typing_status',
            'connection_id' => $connectionId,
            'typing' => $isTyping
        ], $conn);
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

    private function broadcastToSession($sessionId, $data, $excludeConn = null) {
        if (!isset($this->users[$sessionId])) {
            return;
        }

        foreach ($this->users[$sessionId] as $conn) {
            if ($excludeConn && $conn === $excludeConn) {
                continue;
            }
            $conn->send(json_encode($data));
        }
    }
}

// Run WebSocket server
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8080
);

echo "WebSocket server running on port 8080\n";
$server->run();
