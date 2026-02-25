<?php

require_once __DIR__ . '/../utils/Database.php';

class Product {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll($category = null, $limit = null, $offset = null, $search = null, $minPrice = null, $maxPrice = null, $sortBy = 'created_at', $sortOrder = 'DESC') {
        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug";
        
        $params = [];
        
        // Add relevance_score only if searching
        if ($search) {
            $sql .= ", MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score";
            $params[] = $search;
        }
        
        $sql .= " FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.is_active = 1";
        
        if ($category) {
            $sql .= " AND c.slug = ?";
            $params[] = $category;
        }
        
        if ($search) {
            $sql .= " AND (MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) > 0 
                        OR p.name LIKE ? OR p.description LIKE ?)";
            $params[] = $search;
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($minPrice !== null && $minPrice !== '') {
            $sql .= " AND p.price >= ?";
            $params[] = (float)$minPrice;
        }
        
        if ($maxPrice !== null && $maxPrice !== '') {
            $sql .= " AND p.price <= ?";
            $params[] = (float)$maxPrice;
        }
        
        // Enhanced sorting options
        $allowedSortFields = ['created_at', 'price', 'name', 'stock', 'relevance_score'];
        $allowedSortOrders = ['ASC', 'DESC'];
        
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
        $sortOrder = in_array(strtoupper($sortOrder), $allowedSortOrders) ? strtoupper($sortOrder) : 'DESC';
        
        // If searching, prioritize relevance
        if ($search && $sortBy === 'created_at') {
            $sql .= " ORDER BY relevance_score DESC, p.created_at $sortOrder";
        } else {
            $sql .= " ORDER BY p.$sortBy $sortOrder";
        }
        
        if ($limit) {
            $sql .= " LIMIT ?";
            $params[] = (int)$limit;
            
            if ($offset) {
                $sql .= " OFFSET ?";
                $params[] = (int)$offset;
            }
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add images to each product
        foreach ($products as &$product) {
            $product['images'] = $this->getProductImages($product['id']);
            // Remove relevance_score from output if not searching
            if (!$search) {
                unset($product['relevance_score']);
            }
        }
        
        return $products;
    }

    public function getById($id) {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.name as category_name, c.slug as category_slug 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ? AND p.is_active = 1"
        );
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        if ($product) {
            $product['images'] = $this->getProductImages($id);
            $product['rating_stats'] = $this->getRatingStats($id);
        }
        
        return $product;
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
            WHERE product_id = ?
        ");
        $stmt->execute([$productId]);
        $stats = $stmt->fetch();

        if ($stats['total_reviews'] == 0) {
            return [
                'average' => 0,
                'total' => 0,
                'distribution' => [
                    5 => ['count' => 0, 'percentage' => 0],
                    4 => ['count' => 0, 'percentage' => 0],
                    3 => ['count' => 0, 'percentage' => 0],
                    2 => ['count' => 0, 'percentage' => 0],
                    1 => ['count' => 0, 'percentage' => 0]
                ]
            ];
        }

        $total = $stats['total_reviews'];
        return [
            'average' => round($stats['average_rating'], 1),
            'total' => $total,
            'distribution' => [
                5 => ['count' => $stats['five_star'], 'percentage' => round(($stats['five_star'] / $total) * 100)],
                4 => ['count' => $stats['four_star'], 'percentage' => round(($stats['four_star'] / $total) * 100)],
                3 => ['count' => $stats['three_star'], 'percentage' => round(($stats['three_star'] / $total) * 100)],
                2 => ['count' => $stats['two_star'], 'percentage' => round(($stats['two_star'] / $total) * 100)],
                1 => ['count' => $stats['one_star'], 'percentage' => round(($stats['one_star'] / $total) * 100)]
            ]
        ];
    }

    
    /**
     * Update product with rating data (for SEO structured data)
     */
    public function getProductWithRating($id) {
        $product = $this->getById($id);
        
        if ($product && $product['rating_stats']['total'] > 0) {
            $product['aggregate_rating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => $product['rating_stats']['average'],
                'reviewCount' => $product['rating_stats']['total'],
                'bestRating' => 5,
                'worstRating' => 1
            ];
        }
        
        return $product;
    }

    public function getProductImages($productId) {
        $stmt = $this->db->prepare(
            "SELECT * FROM product_images 
             WHERE product_id = ? 
             ORDER BY sort_order ASC"
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public function create($name, $slug, $description, $price, $categoryId, $imageUrl, $stock) {
        $stmt = $this->db->prepare(
            "INSERT INTO products (name, slug, description, price, category_id, image_url, stock) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        
        $stmt->execute([$name, $slug, $description, $price, $categoryId, $imageUrl, $stock]);
        
        return $this->db->lastInsertId();
    }

    public function update($id, $name, $slug, $description, $price, $categoryId, $imageUrl, $stock) {
        $stmt = $this->db->prepare(
            "UPDATE products 
             SET name = ?, slug = ?, description = ?, price = ?, category_id = ?, image_url = ?, stock = ? 
             WHERE id = ?"
        );
        
        return $stmt->execute([$name, $slug, $description, $price, $categoryId, $imageUrl, $stock, $id]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getCount($category = null, $search = null, $minPrice = null, $maxPrice = null) {
        $sql = "SELECT COUNT(*) as total FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.is_active = 1";
        
        $params = [];
        
        if ($category) {
            $sql .= " AND c.slug = ?";
            $params[] = $category;
        }
        
        if ($search) {
            $sql .= " AND (MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) > 0 
                        OR p.name LIKE ? OR p.description LIKE ?)";
            $params[] = $search;
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($minPrice !== null && $minPrice !== '') {
            $sql .= " AND p.price >= ?";
            $params[] = (float)$minPrice;
        }
        
        if ($maxPrice !== null && $maxPrice !== '') {
            $sql .= " AND p.price <= ?";
            $params[] = (float)$maxPrice;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        $result = $stmt->fetch();
        return (int)$result['total'];
    }

    /**
     * Get search suggestions based on product names
     */
    public function getSearchSuggestions($query, $limit = 5) {
        if (strlen($query) < 2) {
            return [];
        }

        $sql = "SELECT DISTINCT p.name, p.slug
                FROM products p 
                WHERE p.is_active = 1 
                AND (p.name LIKE ? OR p.name LIKE ?)
                ORDER BY 
                    CASE 
                        WHEN p.name LIKE ? THEN 1
                        WHEN p.name LIKE ? THEN 2
                        ELSE 3
                    END,
                    p.name ASC
                LIMIT ?";
        
        $params = [
            "$query%",
            "%$query%",
            "$query%",
            "% $query%",
            (int)$limit
        ];
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get popular search terms (based on product names frequency)
     */
    public function getPopularSearchTerms($limit = 10) {
        $sql = "SELECT p.name, COUNT(*) as search_count
                FROM products p 
                WHERE p.is_active = 1 
                GROUP BY p.name
                ORDER BY search_count DESC, p.name ASC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([(int)$limit]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFeatured($limit = 4) {
        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.is_active = 1 AND p.is_featured = 1
                ORDER BY p.created_at DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([(int)$limit]);
        $products = $stmt->fetchAll();
        
        // Add images to each product
        foreach ($products as &$product) {
            $product['images'] = $this->getProductImages($product['id']);
        }
        
        return $products;
    }

    public function getTopRated($limit = 4) {
        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug,
                AVG(r.rating) as avg_rating,
                COUNT(r.id) as review_count
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE p.is_active = 1
                GROUP BY p.id
                ORDER BY avg_rating DESC, review_count DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([(int)$limit]);
        $products = $stmt->fetchAll();
        
        // Add images and rating stats to each product
        foreach ($products as &$product) {
            $product['images'] = $this->getProductImages($product['id']);
            $product['rating_stats'] = [
                'average' => round($product['avg_rating'] ?? 0, 1),
                'total' => $product['review_count'] ?? 0
            ];
        }
        
        return $products;
    }

    public function toggleFeatured($id) {
        $stmt = $this->db->prepare(
            "UPDATE products SET is_featured = NOT is_featured WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }
}
