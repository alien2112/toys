<?php

class Chat {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Generate unique session ID
     */
    public function generateSessionId() {
        do {
            $sessionId = bin2hex(random_bytes(16));
            $stmt = $this->db->prepare("SELECT id FROM chat_sessions WHERE session_id = ?");
            $stmt->execute([$sessionId]);
        } while ($stmt->fetch());
        
        return $sessionId;
    }

    /**
     * Create new chat session
     */
    public function createSession($sessionId, $userId, $visitorIp, $userAgent) {
        $stmt = $this->db->prepare(
            "INSERT INTO chat_sessions (session_id, user_id, visitor_ip, user_agent, status) 
             VALUES (?, ?, ?, ?, 'active')"
        );
        return $stmt->execute([$sessionId, $userId, $visitorIp, $userAgent]);
    }

    /**
     * Get session by session ID
     */
    public function getSessionBySessionId($sessionId) {
        $stmt = $this->db->prepare(
            "SELECT cs.*, u.first_name, u.last_name, u.email,
                    a.first_name as agent_first_name, a.last_name as agent_last_name
             FROM chat_sessions cs
             LEFT JOIN users u ON cs.user_id = u.id
             LEFT JOIN users a ON cs.assigned_agent = a.id
             WHERE cs.session_id = ? AND cs.status IN ('active', 'transferred')"
        );
        $stmt->execute([$sessionId]);
        return $stmt->fetch();
    }

    /**
     * Get active session for user
     */
    public function getActiveUserSession($userId) {
        $stmt = $this->db->prepare(
            "SELECT cs.*, u.first_name, u.last_name, u.email,
                    a.first_name as agent_first_name, a.last_name as agent_last_name
             FROM chat_sessions cs
             LEFT JOIN users u ON cs.user_id = u.id
             LEFT JOIN users a ON cs.assigned_agent = a.id
             WHERE cs.user_id = ? AND cs.status = 'active'
             ORDER BY cs.started_at DESC
             LIMIT 1"
        );
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    /**
     * Get active session for guest (by IP)
     */
    public function getActiveGuestSession($visitorIp) {
        $stmt = $this->db->prepare(
            "SELECT cs.*
             FROM chat_sessions cs
             WHERE cs.visitor_ip = ? AND cs.user_id IS NULL 
             AND cs.status = 'active'
             AND cs.started_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
             ORDER BY cs.started_at DESC
             LIMIT 1"
        );
        $stmt->execute([$visitorIp]);
        return $stmt->fetch();
    }

    /**
     * Get session messages
     */
    public function getSessionMessages($sessionId) {
        $session = $this->getSessionBySessionId($sessionId);
        if (!$session) return [];
        
        $stmt = $this->db->prepare(
            "SELECT cm.*, u.first_name, u.last_name
             FROM chat_messages cm
             LEFT JOIN users u ON cm.sender_id = u.id
             WHERE cm.session_id = ?
             ORDER BY cm.created_at ASC"
        );
        $stmt->execute([$session['id']]);
        return $stmt->fetchAll();
    }

    /**
     * Add message to session
     */
    public function addMessage($sessionId, $senderType, $senderId, $message) {
        $session = $this->getSessionBySessionId($sessionId);
        if (!$session) return false;
        
        $stmt = $this->db->prepare(
            "INSERT INTO chat_messages (session_id, sender_type, sender_id, message) 
             VALUES (?, ?, ?, ?)"
        );
        return $stmt->execute([$session['id'], $senderType, $senderId, $message]) 
            ? $this->db->lastInsertId() 
            : false;
    }

    /**
     * Mark messages as read in session
     */
    public function markMessagesAsRead($sessionId) {
        $session = $this->getSessionBySessionId($sessionId);
        if (!$session) return false;
        
        $stmt = $this->db->prepare(
            "UPDATE chat_messages 
             SET is_read = 1 
             WHERE session_id = ? AND sender_type = 'user' AND is_read = 0"
        );
        return $stmt->execute([$session['id']]);
    }

    /**
     * Get all active sessions (admin)
     */
    public function getActiveSessions() {
        $stmt = $this->db->prepare(
            "SELECT cs.*, u.first_name, u.last_name, u.email,
                    a.first_name as agent_first_name, a.last_name as agent_last_name,
                    (SELECT COUNT(*) FROM chat_messages cm WHERE cm.session_id = cs.id) as message_count,
                    (SELECT COUNT(*) FROM chat_messages cm WHERE cm.session_id = cs.id AND cm.sender_type = 'user' AND cm.is_read = 0) as unread_count
             FROM chat_sessions cs
             LEFT JOIN users u ON cs.user_id = u.id
             LEFT JOIN users a ON cs.assigned_agent = a.id
             WHERE cs.status = 'active'
             ORDER BY cs.started_at ASC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Assign agent to session
     */
    public function assignAgent($sessionId, $agentId = null) {
        $session = $this->getSessionBySessionId($sessionId);
        if (!$session) return false;
        
        $stmt = $this->db->prepare(
            "UPDATE chat_sessions 
             SET assigned_agent = ?, status = 'active' 
             WHERE id = ?"
        );
        return $stmt->execute([$agentId, $session['id']]);
    }

    /**
     * End chat session
     */
    public function endSession($sessionId) {
        $session = $this->getSessionBySessionId($sessionId);
        if (!$session) return false;
        
        $stmt = $this->db->prepare(
            "UPDATE chat_sessions 
             SET status = 'ended', ended_at = NOW() 
             WHERE id = ?"
        );
        return $stmt->execute([$session['id']]);
    }

    /**
     * Transfer session to another agent
     */
    public function transferSession($sessionId, $toAgentId) {
        $session = $this->getSessionBySessionId($sessionId);
        if (!$session) return false;
        
        $stmt = $this->db->prepare(
            "UPDATE chat_sessions 
             SET assigned_agent = ?, status = 'transferred' 
             WHERE id = ?"
        );
        return $stmt->execute([$toAgentId, $session['id']]);
    }

    /**
     * Get chat statistics
     */
    public function getChatStats() {
        $stmt = $this->db->prepare(
            "SELECT 
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions,
                COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended_sessions,
                COUNT(CASE WHEN started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as today_sessions,
                COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as registered_user_sessions,
                COUNT(CASE WHEN user_id IS NULL THEN 1 END) as guest_sessions,
                AVG(TIMESTAMPDIFF(MINUTE, started_at, COALESCE(ended_at, NOW()))) as avg_duration_minutes
             FROM chat_sessions
             WHERE started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Get user message count for session (for anonymous users)
     */
    public function getUserMessageCount($sessionId) {
        $session = $this->getSessionBySessionId($sessionId);
        if (!$session) return 0;

        $stmt = $this->db->prepare(
            "SELECT COUNT(*) as count FROM chat_messages
             WHERE session_id = ? AND sender_type = 'user'"
        );
        $stmt->execute([$session['id']]);
        $result = $stmt->fetch();
        return (int)$result['count'];
    }

    /**
     * Clean up old inactive sessions
     */
    public function cleanupOldSessions() {
        // End sessions inactive for more than 2 hours
        $stmt = $this->db->prepare(
            "UPDATE chat_sessions
             SET status = 'ended', ended_at = NOW()
             WHERE status = 'active'
             AND started_at < DATE_SUB(NOW(), INTERVAL 2 HOUR)
             AND id NOT IN (
                 SELECT DISTINCT session_id
                 FROM chat_messages
                 WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)
             )"
        );
        return $stmt->execute();
    }
}
