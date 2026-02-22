<?php

class Support {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create support ticket
     */
    public function createTicket($data) {
        $stmt = $this->db->prepare(
            "INSERT INTO support_tickets (ticket_number, user_id, subject, description, category, priority, order_id, product_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        $ticketNumber = $this->generateTicketNumber();
        
        return $stmt->execute([
            $ticketNumber,
            $data['user_id'],
            $data['subject'],
            $data['description'],
            $data['category'] ?? 'other',
            $data['priority'] ?? 'medium',
            $data['order_id'] ?? null,
            $data['product_id'] ?? null
        ]);
    }

    /**
     * Generate unique ticket number
     */
    private function generateTicketNumber() {
        do {
            $number = 'TKT-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $stmt = $this->db->prepare("SELECT id FROM support_tickets WHERE ticket_number = ?");
            $stmt->execute([$number]);
        } while ($stmt->fetch());
        
        return $number;
    }

    /**
     * Get user's tickets
     */
    public function getUserTickets($userId, $limit = 50) {
        $stmt = $this->db->prepare(
            "SELECT st.*, 
                    (SELECT COUNT(*) FROM ticket_replies tr WHERE tr.ticket_id = st.id) as reply_count
             FROM support_tickets st
             WHERE st.user_id = ?
             ORDER BY st.created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    }

    /**
     * Get ticket by ID with replies
     */
    public function getTicketById($ticketId, $userId = null) {
        $sql = "SELECT st.*, u.first_name, u.last_name, u.email as user_email
                FROM support_tickets st
                JOIN users u ON st.user_id = u.id
                WHERE st.id = ?";
        
        if ($userId) {
            $sql .= " AND st.user_id = ?";
        }
        
        $stmt = $this->db->prepare($sql);
        $params = $userId ? [$ticketId, $userId] : [$ticketId];
        $stmt->execute($params);
        
        $ticket = $stmt->fetch();
        
        if ($ticket) {
            // Get replies
            $stmt = $this->db->prepare(
                "SELECT tr.*, u.first_name, u.last_name 
                 FROM ticket_replies tr
                 LEFT JOIN users u ON tr.user_id = u.id
                 WHERE tr.ticket_id = ?
                 ORDER BY tr.created_at ASC"
            );
            $stmt->execute([$ticketId]);
            $ticket['replies'] = $stmt->fetchAll();
        }
        
        return $ticket;
    }

    /**
     * Add reply to ticket
     */
    public function addReply($ticketId, $message, $userId = null, $isAdmin = false) {
        $stmt = $this->db->prepare(
            "INSERT INTO ticket_replies (ticket_id, user_id, is_admin, message) 
             VALUES (?, ?, ?, ?)"
        );
        
        $result = $stmt->execute([$ticketId, $userId, $isAdmin ? 1 : 0, $message]);
        
        if ($result) {
            // Update ticket status if needed
            if (!$isAdmin) {
                $this->updateTicketStatus($ticketId, 'waiting_customer');
            } else {
                $this->updateTicketStatus($ticketId, 'in_progress');
            }
        }
        
        return $result;
    }

    /**
     * Update ticket status
     */
    public function updateTicketStatus($ticketId, $status) {
        $stmt = $this->db->prepare(
            "UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?"
        );
        
        if ($status === 'resolved') {
            $stmt = $this->db->prepare(
                "UPDATE support_tickets SET status = ?, updated_at = NOW(), resolved_at = NOW() WHERE id = ?"
            );
        }
        
        return $stmt->execute([$status, $ticketId]);
    }

    /**
     * Get all tickets for admin
     */
    public function getAllTickets($status = null, $category = null, $limit = 50) {
        $sql = "SELECT st.*, u.first_name, u.last_name, u.email as user_email,
                       (SELECT COUNT(*) FROM ticket_replies tr WHERE tr.ticket_id = st.id) as reply_count
                FROM support_tickets st
                JOIN users u ON st.user_id = u.id";
        
        $params = [];
        
        if ($status) {
            $sql .= " WHERE st.status = ?";
            $params[] = $status;
        }
        
        if ($category) {
            $sql .= $status ? " AND st.category = ?" : " WHERE st.category = ?";
            $params[] = $category;
        }
        
        $sql .= " ORDER BY st.created_at DESC LIMIT ?";
        $params[] = $limit;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Assign ticket to admin
     */
    public function assignTicket($ticketId, $adminId) {
        $stmt = $this->db->prepare(
            "UPDATE support_tickets SET assigned_to = ?, status = 'in_progress', updated_at = NOW() 
             WHERE id = ?"
        );
        return $stmt->execute([$adminId, $ticketId]);
    }

    /**
     * Get support categories
     */
    public function getCategories() {
        $stmt = $this->db->prepare("SELECT * FROM support_categories WHERE is_active = 1 ORDER BY sort_order");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Get ticket statistics
     */
    public function getTicketStats() {
        $stmt = $this->db->prepare(
            "SELECT 
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as today_tickets,
                AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
             FROM support_tickets
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );
        $stmt->execute();
        return $stmt->fetch();
    }
}
