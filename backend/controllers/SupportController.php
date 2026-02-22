<?php

require_once __DIR__ . '/../models/Support.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class SupportController {
    private $supportModel;

    public function __construct() {
        $this->supportModel = new Support();
    }

    /**
     * Create support ticket
     */
    public function createTicket() {
        $user = AuthMiddleware::authenticate();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($data['subject']) || empty(trim($data['subject']))) {
            Response::error('Subject is required', 400);
        }
        
        if (!isset($data['description']) || empty(trim($data['description']))) {
            Response::error('Description is required', 400);
        }
        
        // Validate category
        $validCategories = ['order', 'payment', 'product', 'shipping', 'return', 'technical', 'other'];
        if (isset($data['category']) && !in_array($data['category'], $validCategories)) {
            Response::error('Invalid category', 400);
        }
        
        // Validate priority
        $validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (isset($data['priority']) && !in_array($data['priority'], $validPriorities)) {
            Response::error('Invalid priority', 400);
        }
        
        // Validate references
        if (isset($data['order_id']) && !Validator::integer($data['order_id'])) {
            Response::error('Invalid order ID', 400);
        }
        
        if (isset($data['product_id']) && !Validator::integer($data['product_id'])) {
            Response::error('Invalid product ID', 400);
        }
        
        $ticketData = [
            'user_id' => $user['user_id'],
            'subject' => $data['subject'],
            'description' => $data['description'],
            'category' => $data['category'] ?? 'other',
            'priority' => $data['priority'] ?? 'medium',
            'order_id' => $data['order_id'] ?? null,
            'product_id' => $data['product_id'] ?? null
        ];
        
        if ($this->supportModel->createTicket($ticketData)) {
            Response::success(null, 'Ticket created successfully', 201);
        } else {
            Response::error('Failed to create ticket', 500);
        }
    }

    /**
     * Get user's tickets
     */
    public function getUserTickets() {
        $user = AuthMiddleware::authenticate();
        
        $limit = $_GET['limit'] ?? 50;
        $tickets = $this->supportModel->getUserTickets($user['user_id'], $limit);
        
        Response::success($tickets);
    }

    /**
     * Get ticket by ID
     */
    public function getTicket($ticketId) {
        $user = AuthMiddleware::authenticate();
        
        if (!Validator::integer($ticketId)) {
            Response::error('Invalid ticket ID', 400);
        }
        
        $ticket = $this->supportModel->getTicketById($ticketId, $user['user_id']);
        
        if (!$ticket) {
            Response::error('Ticket not found', 404);
        }
        
        Response::success($ticket);
    }

    /**
     * Add reply to ticket
     */
    public function addReply($ticketId) {
        $user = AuthMiddleware::authenticate();
        
        if (!Validator::integer($ticketId)) {
            Response::error('Invalid ticket ID', 400);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['message']) || empty(trim($data['message']))) {
            Response::error('Message is required', 400);
        }
        
        // Verify ticket belongs to user
        $ticket = $this->supportModel->getTicketById($ticketId, $user['user_id']);
        if (!$ticket) {
            Response::error('Ticket not found', 404);
        }
        
        if ($this->supportModel->addReply($ticketId, $data['message'], $user['user_id'], false)) {
            Response::success(null, 'Reply added successfully', 201);
        } else {
            Response::error('Failed to add reply', 500);
        }
    }

    /**
     * Get all tickets (admin)
     */
    public function getAllTickets() {
        AuthMiddleware::requireAdmin();
        
        $status = $_GET['status'] ?? null;
        $category = $_GET['category'] ?? null;
        $limit = $_GET['limit'] ?? 50;
        
        $tickets = $this->supportModel->getAllTickets($status, $category, $limit);
        Response::success($tickets);
    }

    /**
     * Get ticket details (admin)
     */
    public function getTicketDetails($ticketId) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($ticketId)) {
            Response::error('Invalid ticket ID', 400);
        }
        
        $ticket = $this->supportModel->getTicketById($ticketId);
        
        if (!$ticket) {
            Response::error('Ticket not found', 404);
        }
        
        Response::success($ticket);
    }

    /**
     * Add admin reply
     */
    public function addAdminReply($ticketId) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($ticketId)) {
            Response::error('Invalid ticket ID', 400);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['message']) || empty(trim($data['message']))) {
            Response::error('Message is required', 400);
        }
        
        if ($this->supportModel->addReply($ticketId, $data['message'], null, true)) {
            Response::success(null, 'Reply added successfully', 201);
        } else {
            Response::error('Failed to add reply', 500);
        }
    }

    /**
     * Update ticket status
     */
    public function updateTicketStatus($ticketId) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($ticketId)) {
            Response::error('Invalid ticket ID', 400);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['status'])) {
            Response::error('Status is required', 400);
        }
        
        $validStatuses = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
        if (!in_array($data['status'], $validStatuses)) {
            Response::error('Invalid status', 400);
        }
        
        if ($this->supportModel->updateTicketStatus($ticketId, $data['status'])) {
            Response::success(null, 'Ticket status updated');
        } else {
            Response::error('Failed to update ticket status', 500);
        }
    }

    /**
     * Assign ticket to admin
     */
    public function assignTicket($ticketId) {
        AuthMiddleware::requireAdmin();
        
        if (!Validator::integer($ticketId)) {
            Response::error('Invalid ticket ID', 400);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['admin_id'])) {
            Response::error('Admin ID is required', 400);
        }
        
        if (!Validator::integer($data['admin_id'])) {
            Response::error('Invalid admin ID', 400);
        }
        
        if ($this->supportModel->assignTicket($ticketId, $data['admin_id'])) {
            Response::success(null, 'Ticket assigned successfully');
        } else {
            Response::error('Failed to assign ticket', 500);
        }
    }

    /**
     * Get support categories
     */
    public function getCategories() {
        $categories = $this->supportModel->getCategories();
        Response::success($categories);
    }

    /**
     * Get ticket statistics
     */
    public function getTicketStats() {
        AuthMiddleware::requireAdmin();
        
        $stats = $this->supportModel->getTicketStats();
        Response::success($stats);
    }
}
