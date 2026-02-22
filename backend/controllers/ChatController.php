<?php

require_once __DIR__ . '/../models/Chat.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class ChatController {
    private $chatModel;

    public function __construct() {
        $this->chatModel = new Chat();
    }

    /**
     * Create or get chat session
     */
    public function createSession() {
        $data = json_decode(file_get_contents('php://input'), true);
        $user = AuthMiddleware::authenticate(false); // Allow guests
        
        $userId = $user ? $user['user_id'] : null;
        $visitorIp = $_SERVER['REMOTE_ADDR'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Check if user has an active session
        if ($userId) {
            $existingSession = $this->chatModel->getActiveUserSession($userId);
            if ($existingSession) {
                Response::success($existingSession);
                return;
            }
        }
        
        // Check if guest has an active session (by IP)
        if (!$userId) {
            $existingSession = $this->chatModel->getActiveGuestSession($visitorIp);
            if ($existingSession) {
                Response::success($existingSession);
                return;
            }
        }
        
        $sessionId = $this->chatModel->generateSessionId();
        
        if ($this->chatModel->createSession($sessionId, $userId, $visitorIp, $userAgent)) {
            $session = $this->chatModel->getSessionBySessionId($sessionId);
            Response::success($session, 'Chat session created', 201);
        } else {
            Response::error('Failed to create chat session', 500);
        }
    }

    /**
     * Get session messages
     */
    public function getSessionMessages($sessionId) {
        $session = $this->chatModel->getSessionBySessionId($sessionId);
        
        if (!$session) {
            Response::error('Chat session not found', 404);
        }
        
        // Check if user can access this session
        $user = AuthMiddleware::authenticate(false);
        if ($user && $session['user_id'] !== $user['user_id']) {
            // Admin access check
            AuthMiddleware::requireAdmin();
        }
        
        $messages = $this->chatModel->getSessionMessages($sessionId);
        Response::success($messages);
    }

    /**
     * Send message
     */
    public function sendMessage($sessionId) {
        $session = $this->chatModel->getSessionBySessionId($sessionId);
        
        if (!$session) {
            Response::error('Chat session not found', 404);
        }
        
        if ($session['status'] !== 'active') {
            Response::error('Chat session is not active', 400);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['message']) || empty(trim($data['message']))) {
            Response::error('Message is required', 400);
        }
        
        $user = AuthMiddleware::authenticate(false);
        $senderType = 'user';
        $senderId = null;
        
        if ($user) {
            $senderId = $user['user_id'];
            
            // Check if user owns this session or is admin
            if ($session['user_id'] !== $user['user_id']) {
                AuthMiddleware::requireAdmin();
                $senderType = 'agent';
            }
        } else {
            // Guest user - verify by IP
            if ($session['visitor_ip'] !== $_SERVER['REMOTE_ADDR']) {
                Response::error('Unauthorized', 403);
            }
        }
        
        $messageId = $this->chatModel->addMessage($sessionId, $senderType, $senderId, $data['message']);
        
        if ($messageId) {
            // Mark messages as read if agent is replying
            if ($senderType === 'agent') {
                $this->chatModel->markMessagesAsRead($sessionId);
            }
            
            Response::success(['id' => $messageId], 'Message sent', 201);
        } else {
            Response::error('Failed to send message', 500);
        }
    }

    /**
     * Get active chat sessions (admin only)
     */
    public function getActiveSessions() {
        AuthMiddleware::requireAdmin();
        
        $sessions = $this->chatModel->getActiveSessions();
        Response::success($sessions);
    }

    /**
     * Assign agent to session (admin only)
     */
    public function assignAgent($sessionId) {
        AuthMiddleware::requireAdmin();
        
        $session = $this->chatModel->getSessionBySessionId($sessionId);
        if (!$session) {
            Response::error('Chat session not found', 404);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $agentId = $data['agent_id'] ?? null;
        
        if ($this->chatModel->assignAgent($sessionId, $agentId)) {
            Response::success(null, 'Agent assigned to session');
        } else {
            Response::error('Failed to assign agent', 500);
        }
    }

    /**
     * End chat session
     */
    public function endSession($sessionId) {
        $session = $this->chatModel->getSessionBySessionId($sessionId);
        
        if (!$session) {
            Response::error('Chat session not found', 404);
        }
        
        $user = AuthMiddleware::authenticate(false);
        
        // Check permissions
        if ($user) {
            if ($session['user_id'] !== $user['user_id']) {
                AuthMiddleware::requireAdmin();
            }
        } else {
            // Guest user - verify by IP
            if ($session['visitor_ip'] !== $_SERVER['REMOTE_ADDR']) {
                Response::error('Unauthorized', 403);
            }
        }
        
        if ($this->chatModel->endSession($sessionId)) {
            Response::success(null, 'Chat session ended');
        } else {
            Response::error('Failed to end session', 500);
        }
    }

    /**
     * Transfer session (admin only)
     */
    public function transferSession($sessionId) {
        AuthMiddleware::requireAdmin();
        
        $session = $this->chatModel->getSessionBySessionId($sessionId);
        if (!$session) {
            Response::error('Chat session not found', 404);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $toAgentId = $data['to_agent_id'] ?? null;
        
        if ($this->chatModel->transferSession($sessionId, $toAgentId)) {
            Response::success(null, 'Session transferred');
        } else {
            Response::error('Failed to transfer session', 500);
        }
    }

    /**
     * Get chat statistics (admin only)
     */
    public function getChatStats() {
        AuthMiddleware::requireAdmin();
        
        $stats = $this->chatModel->getChatStats();
        Response::success($stats);
    }
}
