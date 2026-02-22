<?php

require_once __DIR__ . '/../utils/Database.php';

class Review {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Verify if user can review this product (delivered order only)
     */
    public function canUserReviewProduct($userId, $productId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as can_review
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
            AND oi.product_id = ? 
            AND o.status = 'delivered'
            AND o.created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)
        ");
        $stmt->execute([$userId, $productId]);
        $result = $stmt->fetch();
        return $result['can_review'] > 0;
    }

    /**
     * Check if user already reviewed this product
     */
    public function hasUserReviewedProduct($userId, $productId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as has_reviewed
            FROM reviews 
            WHERE user_id = ? AND product_id = ?
        ");
        $stmt->execute([$userId, $productId]);
        $result = $stmt->fetch();
        return $result['has_reviewed'] > 0;
    }

    /**
     * Get user's delivered order for this product
     */
    public function getUserDeliveredOrder($userId, $productId) {
        $stmt = $this->db->prepare("
            SELECT o.id, o.created_at as order_date
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
            AND oi.product_id = ? 
            AND o.status = 'delivered'
            ORDER BY o.created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$userId, $productId]);
        return $stmt->fetch();
    }

    /**
     * Create a new review with security validation
     */
    public function create($data) {
        // Validate required fields
        if (!isset($data['product_id']) || !isset($data['user_id']) || !isset($data['rating'])) {
            throw new Exception('Missing required fields');
        }

        // Validate rating range
        $rating = (int)$data['rating'];
        if ($rating < 1 || $rating > 5) {
            throw new Exception('Rating must be between 1 and 5');
        }

        // Check if user can review this product
        if (!$this->canUserReviewProduct($data['user_id'], $data['product_id'])) {
            throw new Exception('You can only review products you have purchased and received');
        }

        // Check for duplicate review
        if ($this->hasUserReviewedProduct($data['user_id'], $data['product_id'])) {
            throw new Exception('You have already reviewed this product');
        }

        // Get order info for verification
        $order = $this->getUserDeliveredOrder($data['user_id'], $data['product_id']);
        if (!$order) {
            throw new Exception('No delivered order found for this product');
        }

        // Sanitize review text
        $reviewText = isset($data['review_text']) ? $this->sanitizeReviewText($data['review_text']) : null;

        // Get client info for security
        $ipAddress = $this->getClientIp();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $this->db->beginTransaction();

        try {
            // Insert the review
            $stmt = $this->db->prepare("
                INSERT INTO reviews (
                    product_id, user_id, order_id, rating, review_text, 
                    is_verified_purchase, ip_address, user_agent, status
                ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, 'approved')
            ");
            
            $stmt->execute([
                $data['product_id'],
                $data['user_id'],
                $order['id'],
                $rating,
                $reviewText,
                $ipAddress,
                $userAgent
            ]);

            $reviewId = $this->db->lastInsertId();

            // Log the action for audit
            $this->logAuditAction($reviewId, 'created', $data['user_id'], null, [
                'product_id' => $data['product_id'],
                'rating' => $rating,
                'review_text' => $reviewText
            ], $ipAddress, $userAgent);

            $this->db->commit();
            return $reviewId;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Update existing review
     */
    public function update($reviewId, $userId, $data) {
        // Validate ownership
        if (!$this->isReviewOwner($reviewId, $userId)) {
            throw new Exception('Unauthorized: You can only edit your own reviews');
        }

        // Get current review for audit
        $currentReview = $this->getById($reviewId);
        if (!$currentReview) {
            throw new Exception('Review not found');
        }

        // Validate rating
        if (isset($data['rating'])) {
            $rating = (int)$data['rating'];
            if ($rating < 1 || $rating > 5) {
                throw new Exception('Rating must be between 1 and 5');
            }
        }

        // Sanitize review text
        $reviewText = isset($data['review_text']) ? $this->sanitizeReviewText($data['review_text']) : $currentReview['review_text'];

        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("
                UPDATE reviews 
                SET rating = COALESCE(?, rating), 
                    review_text = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            ");
            
            $stmt->execute([
                $data['rating'] ?? null,
                $reviewText,
                $reviewId,
                $userId
            ]);

            // Log the action
            $this->logAuditAction($reviewId, 'updated', $userId, $currentReview, [
                'rating' => $data['rating'] ?? $currentReview['rating'],
                'review_text' => $reviewText
            ], $this->getClientIp(), $_SERVER['HTTP_USER_AGENT'] ?? null);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Delete review
     */
    public function delete($reviewId, $userId) {
        if (!$this->isReviewOwner($reviewId, $userId)) {
            throw new Exception('Unauthorized: You can only delete your own reviews');
        }

        $currentReview = $this->getById($reviewId);
        if (!$currentReview) {
            throw new Exception('Review not found');
        }

        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("DELETE FROM reviews WHERE id = ? AND user_id = ?");
            $stmt->execute([$reviewId, $userId]);

            // Log the action
            $this->logAuditAction($reviewId, 'deleted', $userId, $currentReview, null, 
                $this->getClientIp(), $_SERVER['HTTP_USER_AGENT'] ?? null);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Get reviews by product with pagination and sorting
     */
    public function getByProductId($productId, $page = 1, $limit = 10, $sort = 'newest', $status = 'approved') {
        $offset = ($page - 1) * $limit;
        
        $sortClause = $this->getSortClause($sort);
        
        $stmt = $this->db->prepare("
            SELECT r.*, 
                   u.first_name, u.last_name, 
                   CONCAT(u.first_name, ' ', u.last_name) as user_name,
                   o.created_at as order_date,
                   (SELECT COUNT(*) FROM review_helpful_votes rhv WHERE rhv.review_id = r.id AND rhv.vote_type = 'helpful') as helpful_votes,
                   (SELECT COUNT(*) FROM review_helpful_votes rhv WHERE rhv.review_id = r.id AND rhv.vote_type = 'not_helpful') as not_helpful_votes
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN orders o ON r.order_id = o.id
            WHERE r.product_id = ? AND r.status = ?
            ORDER BY $sortClause
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute([$productId, $status, $limit, $offset]);
        return $stmt->fetchAll();
    }

    /**
     * Get review by ID
     */
    public function getById($reviewId) {
        $stmt = $this->db->prepare("
            SELECT r.*, u.first_name, u.last_name,
                   CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        ");
        $stmt->execute([$reviewId]);
        return $stmt->fetch();
    }

    /**
     * Get rating statistics for a product
     */
    public function getRatingStats($productId) {
        $stmt = $this->db->prepare("
            SELECT 
                AVG(rating) as average_rating,
                COUNT(*) as total_reviews,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews 
            WHERE product_id = ? AND status = 'approved'
        ");
        $stmt->execute([$productId]);
        return $stmt->fetch();
    }

    /**
     * Get rating distribution for display
     */
    public function getRatingDistribution($productId) {
        $stats = $this->getRatingStats($productId);
        $total = $stats['total_reviews'] ?? 0;
        
        if ($total == 0) {
            return [
                5 => ['count' => 0, 'percentage' => 0],
                4 => ['count' => 0, 'percentage' => 0],
                3 => ['count' => 0, 'percentage' => 0],
                2 => ['count' => 0, 'percentage' => 0],
                1 => ['count' => 0, 'percentage' => 0],
                'average' => 0,
                'total' => 0
            ];
        }

        return [
            5 => ['count' => $stats['five_star'], 'percentage' => round(($stats['five_star'] / $total) * 100)],
            4 => ['count' => $stats['four_star'], 'percentage' => round(($stats['four_star'] / $total) * 100)],
            3 => ['count' => $stats['three_star'], 'percentage' => round(($stats['three_star'] / $total) * 100)],
            2 => ['count' => $stats['two_star'], 'percentage' => round(($stats['two_star'] / $total) * 100)],
            1 => ['count' => $stats['one_star'], 'percentage' => round(($stats['one_star'] / $total) * 100)],
            'average' => round($stats['average_rating'], 1),
            'total' => $total
        ];
    }

    /**
     * Check if user owns this review
     */
    private function isReviewOwner($reviewId, $userId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as is_owner FROM reviews WHERE id = ? AND user_id = ?");
        $stmt->execute([$reviewId, $userId]);
        $result = $stmt->fetch();
        return $result['is_owner'] > 0;
    }

    /**
     * Sanitize review text to prevent XSS
     */
    private function sanitizeReviewText($text) {
        if (empty($text)) return null;
        
        // Strip HTML tags
        $text = strip_tags($text);
        
        // Escape special characters
        $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
        
        // Trim whitespace
        $text = trim($text);
        
        // Limit length
        if (strlen($text) > 2000) {
            $text = substr($text, 0, 2000);
        }
        
        return $text;
    }

    /**
     * Get client IP address
     */
    private function getClientIp() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? null;
    }

    /**
     * Get sort clause for reviews
     */
    private function getSortClause($sort) {
        switch ($sort) {
            case 'highest':
                return 'r.rating DESC, r.created_at DESC';
            case 'lowest':
                return 'r.rating ASC, r.created_at DESC';
            case 'helpful':
                return '(SELECT COUNT(*) FROM review_helpful_votes rhv WHERE rhv.review_id = r.id AND rhv.vote_type = "helpful") DESC, r.created_at DESC';
            case 'newest':
            default:
                return 'r.created_at DESC';
        }
    }

    /**
     * Log audit action
     */
    private function logAuditAction($reviewId, $action, $userId, $oldData, $newData, $ipAddress, $userAgent) {
        $stmt = $this->db->prepare("
            INSERT INTO review_audit_log (review_id, action, user_id, old_data, new_data, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $reviewId,
            $action,
            $userId,
            $oldData ? json_encode($oldData) : null,
            $newData ? json_encode($newData) : null,
            $ipAddress,
            $userAgent
        ]);
    }

    /**
     * Add helpful vote
     */
    public function addHelpfulVote($reviewId, $userId, $voteType) {
        // Check if user already voted
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as has_voted FROM review_helpful_votes 
            WHERE review_id = ? AND user_id = ?
        ");
        $stmt->execute([$reviewId, $userId]);
        $hasVoted = $stmt->fetch()['has_voted'] > 0;

        if ($hasVoted) {
            throw new Exception('You have already voted on this review');
        }

        // Add vote
        $stmt = $this->db->prepare("
            INSERT INTO review_helpful_votes (review_id, user_id, vote_type, ip_address)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$reviewId, $userId, $voteType, $this->getClientIp()]);

        // Update review vote count
        $this->updateHelpfulVoteCount($reviewId);

        return true;
    }

    /**
     * Update helpful vote count
     */
    private function updateHelpfulVoteCount($reviewId) {
        $stmt = $this->db->prepare("
            UPDATE reviews 
            SET helpful_votes = (
                SELECT COUNT(*) FROM review_helpful_votes 
                WHERE review_id = ? AND vote_type = 'helpful'
            )
            WHERE id = ?
        ");
        $stmt->execute([$reviewId, $reviewId]);
    }
}
