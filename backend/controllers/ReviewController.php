<?php

require_once __DIR__ . '/../models/Review.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ReviewController {
    private $reviewModel;
    private $rateLimitWindow = 300; // 5 minutes
    private $maxReviewsPerWindow = 3;

    public function __construct() {
        $this->reviewModel = new Review();
    }

    /**
     * Create a new review with comprehensive security checks
     */
    public function create() {
        // Rate limiting check
        if (!$this->checkRateLimit()) {
            Response::error('Too many review attempts. Please try again later.', 429);
            return;
        }

        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        $this->validateReviewInput($data);

        try {
            // Add user ID to data
            $data['user_id'] = $user['user_id'];

            $reviewId = $this->reviewModel->create($data);

            // Get the created review for response
            $review = $this->reviewModel->getById($reviewId);
            
            Response::success([
                'review' => $review,
                'message' => 'Review created successfully'
            ], 'Review created successfully', 201);

        } catch (Exception $e) {
            error_log('Review creation error: ' . $e->getMessage());
            
            // Don't expose internal errors to client
            $message = in_array($e->getMessage(), [
                'You can only review products you have purchased and received',
                'You have already reviewed this product',
                'Rating must be between 1 and 5',
                'Missing required fields'
            ]) ? $e->getMessage() : 'Failed to create review';

            Response::error($message, 400);
        }
    }

    /**
     * Update an existing review
     */
    public function update($reviewId) {
        // Rate limiting check
        if (!$this->checkRateLimit()) {
            Response::error('Too many update attempts. Please try again later.', 429);
            return;
        }

        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        $this->validateReviewInput($data, true);

        try {
            $success = $this->reviewModel->update($reviewId, $user['user_id'], $data);

            if ($success) {
                $updatedReview = $this->reviewModel->getById($reviewId);
                Response::success([
                    'review' => $updatedReview,
                    'message' => 'Review updated successfully'
                ]);
            } else {
                Response::error('Failed to update review', 500);
            }

        } catch (Exception $e) {
            error_log('Review update error: ' . $e->getMessage());
            
            $message = in_array($e->getMessage(), [
                'Unauthorized: You can only edit your own reviews',
                'Review not found',
                'Rating must be between 1 and 5'
            ]) ? $e->getMessage() : 'Failed to update review';

            Response::error($message, 400);
        }
    }

    /**
     * Delete a review
     */
    public function delete($reviewId) {
        $user = AuthMiddleware::authenticate();

        try {
            $success = $this->reviewModel->delete($reviewId, $user['user_id']);

            if ($success) {
                Response::success(null, 'Review deleted successfully');
            } else {
                Response::error('Failed to delete review', 500);
            }

        } catch (Exception $e) {
            error_log('Review deletion error: ' . $e->getMessage());
            
            $message = in_array($e->getMessage(), [
                'Unauthorized: You can only delete your own reviews',
                'Review not found'
            ]) ? $e->getMessage() : 'Failed to delete review';

            Response::error($message, 400);
        }
    }

    /**
     * Get reviews for a product with pagination and sorting
     */
    public function getByProductId($productId) {
        // Validate product ID
        if (!is_numeric($productId) || $productId <= 0) {
            Response::error('Invalid product ID', 400);
            return;
        }

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 10;
        $sort = isset($_GET['sort']) ? $_GET['sort'] : 'newest';
        $status = isset($_GET['status']) ? $_GET['status'] : 'approved';

        // Validate sort parameter
        $validSorts = ['newest', 'highest', 'lowest', 'helpful'];
        if (!in_array($sort, $validSorts)) {
            $sort = 'newest';
        }

        try {
            $reviews = $this->reviewModel->getByProductId($productId, $page, $limit, $sort, $status);
            $distribution = $this->reviewModel->getRatingDistribution($productId);

            // Get current user's review status if authenticated
            $userReview = null;
            $currentUser = $this->getCurrentUser();
            if ($currentUser) {
                $userReview = $this->reviewModel->getByProductId($productId, 1, 1, 'newest', 'approved');
                $userReview = array_filter($userReview, function($review) use ($currentUser) {
                    return $review['user_id'] == $currentUser['user_id'];
                });
                $userReview = !empty($userReview) ? array_values($userReview)[0] : null;
            }

            Response::success([
                'reviews' => $reviews,
                'distribution' => $distribution,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $distribution['total']
                ],
                'user_review' => $userReview,
                'can_review' => $currentUser ? $this->reviewModel->canUserReviewProduct($currentUser['user_id'], $productId) : false
            ]);

        } catch (Exception $e) {
            error_log('Get reviews error: ' . $e->getMessage());
            Response::error('Failed to retrieve reviews', 500);
        }
    }

    /**
     * Get rating statistics for a product
     */
    public function getRatingStats($productId) {
        if (!is_numeric($productId) || $productId <= 0) {
            Response::error('Invalid product ID', 400);
            return;
        }

        try {
            $stats = $this->reviewModel->getRatingDistribution($productId);
            Response::success($stats);

        } catch (Exception $e) {
            error_log('Get rating stats error: ' . $e->getMessage());
            Response::error('Failed to retrieve rating statistics', 500);
        }
    }

    /**
     * Add helpful vote to a review
     */
    public function addHelpfulVote($reviewId) {
        // Rate limiting check
        if (!$this->checkRateLimit()) {
            Response::error('Too many vote attempts. Please try again later.', 429);
            return;
        }

        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        $voteType = $data['vote_type'] ?? 'helpful';
        if (!in_array($voteType, ['helpful', 'not_helpful'])) {
            Response::error('Invalid vote type', 400);
            return;
        }

        try {
            $success = $this->reviewModel->addHelpfulVote($reviewId, $user['user_id'], $voteType);

            if ($success) {
                Response::success(null, 'Vote recorded successfully');
            } else {
                Response::error('Failed to record vote', 500);
            }

        } catch (Exception $e) {
            error_log('Helpful vote error: ' . $e->getMessage());
            
            $message = in_array($e->getMessage(), [
                'You have already voted on this review'
            ]) ? $e->getMessage() : 'Failed to record vote';

            Response::error($message, 400);
        }
    }

    /**
     * Get user's reviews
     */
    public function getUserReviews() {
        $user = AuthMiddleware::authenticate();
        
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 10;

        try {
            // This would need to be implemented in the Review model
            $stmt = $this->reviewModel->db->prepare("
                SELECT r.*, p.name as product_name, p.slug as product_slug
                FROM reviews r
                JOIN products p ON r.product_id = p.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            ");
            
            $stmt->execute([$user['user_id'], $limit, ($page - 1) * $limit]);
            $reviews = $stmt->fetchAll();

            Response::success([
                'reviews' => $reviews,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit
                ]
            ]);

        } catch (Exception $e) {
            error_log('Get user reviews error: ' . $e->getMessage());
            Response::error('Failed to retrieve user reviews', 500);
        }
    }

    /**
     * Admin: Get all reviews with filtering
     */
    public function getAllReviews() {
        $user = AuthMiddleware::requireAdmin();

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
        $status = isset($_GET['status']) ? $_GET['status'] : 'all';
        $rating = isset($_GET['rating']) ? (int)$_GET['rating'] : null;
        $productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;

        try {
            $whereConditions = ["1=1"];
            $params = [];

            if ($status !== 'all') {
                $whereConditions[] = "r.status = ?";
                $params[] = $status;
            }

            if ($rating !== null && $rating >= 1 && $rating <= 5) {
                $whereConditions[] = "r.rating = ?";
                $params[] = $rating;
            }

            if ($productId !== null && $productId > 0) {
                $whereConditions[] = "r.product_id = ?";
                $params[] = $productId;
            }

            $whereClause = implode(' AND ', $whereConditions);
            $offset = ($page - 1) * $limit;

            $stmt = $this->reviewModel->db->prepare("
                SELECT r.*, 
                       u.first_name, u.last_name, u.email,
                       p.name as product_name,
                       o.created_at as order_date
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN products p ON r.product_id = p.id
                JOIN orders o ON r.order_id = o.id
                WHERE $whereClause
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            ");

            $stmt->execute([...$params, $limit, $offset]);
            $reviews = $stmt->fetchAll();

            // Get total count
            $countStmt = $this->reviewModel->db->prepare("
                SELECT COUNT(*) as total
                FROM reviews r
                WHERE $whereClause
            ");
            $countStmt->execute($params);
            $total = $countStmt->fetch()['total'];

            Response::success([
                'reviews' => $reviews,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (Exception $e) {
            error_log('Get all reviews error: ' . $e->getMessage());
            Response::error('Failed to retrieve reviews', 500);
        }
    }

    /**
     * Admin: Update review status (moderation)
     */
    public function updateReviewStatus($reviewId) {
        $user = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        $status = $data['status'] ?? null;
        $adminNotes = $data['admin_notes'] ?? null;

        if (!in_array($status, ['pending', 'approved', 'rejected', 'flagged'])) {
            Response::error('Invalid status', 400);
            return;
        }

        try {
            $stmt = $this->reviewModel->db->prepare("
                UPDATE reviews 
                SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            
            $success = $stmt->execute([$status, $adminNotes, $reviewId]);

            if ($success) {
                // Log admin action
                $this->logAdminAction($reviewId, $user['user_id'], $status, $adminNotes);
                
                Response::success(null, 'Review status updated successfully');
            } else {
                Response::error('Failed to update review status', 500);
            }

        } catch (Exception $e) {
            error_log('Update review status error: ' . $e->getMessage());
            Response::error('Failed to update review status', 500);
        }
    }

    /**
     * Validate review input data
     */
    private function validateReviewInput($data, $isUpdate = false) {
        if (!$isUpdate) {
            if (!isset($data['product_id']) || !is_numeric($data['product_id']) || $data['product_id'] <= 0) {
                Response::error('Valid product ID is required', 400);
                return false;
            }
        }

        if (isset($data['rating'])) {
            $rating = (int)$data['rating'];
            if ($rating < 1 || $rating > 5) {
                Response::error('Rating must be between 1 and 5', 400);
                return false;
            }
        } elseif (!$isUpdate) {
            Response::error('Rating is required', 400);
            return false;
        }

        if (isset($data['review_text'])) {
            $reviewText = trim($data['review_text']);
            if (strlen($reviewText) > 2000) {
                Response::error('Review text must be less than 2000 characters', 400);
                return false;
            }
        }

        return true;
    }

    /**
     * Check rate limiting for review actions
     */
    private function checkRateLimit() {
        $user = $this->getCurrentUser();
        if (!$user) return false;

        $cacheKey = "review_rate_limit_" . $user['user_id'];
        
        // Simple in-memory rate limiting (in production, use Redis or similar)
        if (!isset($_SESSION[$cacheKey])) {
            $_SESSION[$cacheKey] = [
                'count' => 0,
                'reset_time' => time() + $this->rateLimitWindow
            ];
        }

        $rateLimitData = $_SESSION[$cacheKey];
        
        if (time() > $rateLimitData['reset_time']) {
            $_SESSION[$cacheKey] = [
                'count' => 1,
                'reset_time' => time() + $this->rateLimitWindow
            ];
            return true;
        }

        if ($rateLimitData['count'] >= $this->maxReviewsPerWindow) {
            return false;
        }

        $_SESSION[$cacheKey]['count']++;
        return true;
    }

    /**
     * Get current user (without requiring authentication)
     */
    private function getCurrentUser() {
        try {
            return AuthMiddleware::authenticate();
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Log admin action for audit
     */
    private function logAdminAction($reviewId, $adminId, $status, $adminNotes) {
        try {
            $stmt = $this->reviewModel->db->prepare("
                INSERT INTO review_audit_log (review_id, action, user_id, new_data, ip_address, user_agent)
                VALUES (?, 'status_changed', ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $reviewId,
                $adminId,
                json_encode(['status' => $status, 'admin_notes' => $adminNotes]),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
        } catch (Exception $e) {
            error_log('Failed to log admin action: ' . $e->getMessage());
        }
    }
}
