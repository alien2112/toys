<?php

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AnalyticsController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Track analytics events
     */
    public function trackEvent() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $sessionId = $data['session_id'] ?? $this->generateSessionId();
            $userId = $data['user_id'] ?? null;
            $eventType = $data['event_type'] ?? 'page_view';
            $eventData = json_encode($data['event_data'] ?? []);
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $referrer = $_SERVER['HTTP_REFERER'] ?? null;

            $stmt = $this->db->prepare("
                INSERT INTO analytics_events 
                (session_id, user_id, event_type, event_data, ip_address, user_agent, referrer) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([$sessionId, $userId, $eventType, $eventData, $ipAddress, $userAgent, $referrer]);
            
            Response::success(['event_id' => $this->db->lastInsertId()]);
        } catch (Exception $e) {
            Response::error('Failed to track event: ' . $e->getMessage());
        }
    }

    /**
     * Get sales analytics dashboard data
     */
    public function getSalesAnalytics() {
        AuthMiddleware::requireAdmin();
        
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            
            // Get daily sales data
            $stmt = $this->db->prepare("
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as orders,
                    SUM(total_amount) as revenue,
                    COUNT(DISTINCT user_id) as customers,
                    AVG(total_amount) as avg_order_value
                FROM orders 
                WHERE created_at BETWEEN ? AND ? 
                AND status != 'cancelled'
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            ");
            $stmt->execute([$startDate, $endDate]);
            $dailySales = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get top selling products
            $stmt = $this->db->prepare("
                SELECT 
                    p.name,
                    p.id,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * oi.price) as total_revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                WHERE o.created_at BETWEEN ? AND ? 
                AND o.status != 'cancelled'
                GROUP BY oi.product_id, p.name, p.id
                ORDER BY total_sold DESC
                LIMIT 10
            ");
            $stmt->execute([$startDate, $endDate]);
            $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get sales by category
            $stmt = $this->db->prepare("
                SELECT 
                    c.name,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * oi.price) as total_revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE o.created_at BETWEEN ? AND ? 
                AND o.status != 'cancelled'
                GROUP BY c.id, c.name
                ORDER BY total_revenue DESC
            ");
            $stmt->execute([$startDate, $endDate]);
            $categorySales = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get payment method breakdown
            $stmt = $this->db->prepare("
                SELECT 
                    payment_method,
                    COUNT(*) as count,
                    SUM(total_amount) as revenue
                FROM orders 
                WHERE created_at BETWEEN ? AND ? 
                AND status != 'cancelled'
                GROUP BY payment_method
            ");
            $stmt->execute([$startDate, $endDate]);
            $paymentMethods = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get overall KPIs
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    COUNT(DISTINCT user_id) as total_customers,
                    AVG(total_amount) as avg_order_value,
                    COUNT(*) - COUNT(DISTINCT user_id) as repeat_orders
                FROM orders 
                WHERE created_at BETWEEN ? AND ? 
                AND status != 'cancelled'
            ");
            $stmt->execute([$startDate, $endDate]);
            $kpis = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Calculate growth rates
            $prevStartDate = date('Y-m-d', strtotime($startDate . ' - ' . (strtotime($endDate) - strtotime($startDate)) . ' days'));
            $prevEndDate = $startDate;
            
            $stmt = $this->db->prepare("
                SELECT 
                    SUM(total_amount) as prev_revenue,
                    COUNT(*) as prev_orders
                FROM orders 
                WHERE created_at BETWEEN ? AND ? 
                AND status != 'cancelled'
            ");
            $stmt->execute([$prevStartDate, $prevEndDate]);
            $prevData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $revenueGrowth = $prevData['prev_revenue'] > 0 ? 
                round((($kpis['total_revenue'] - $prevData['prev_revenue']) / $prevData['prev_revenue']) * 100, 2) : 0;
            $ordersGrowth = $prevData['prev_orders'] > 0 ? 
                round((($kpis['total_orders'] - $prevData['prev_orders']) / $prevData['prev_orders']) * 100, 2) : 0;
            
            Response::success([
                'daily_sales' => $dailySales,
                'top_products' => $topProducts,
                'category_sales' => $categorySales,
                'payment_methods' => $paymentMethods,
                'kpis' => array_merge($kpis, [
                    'revenue_growth' => $revenueGrowth,
                    'orders_growth' => $ordersGrowth
                ])
            ]);
        } catch (Exception $e) {
            Response::error('Failed to get sales analytics: ' . $e->getMessage());
        }
    }

    /**
     * Get customer behavior analytics
     */
    public function getCustomerBehaviorAnalytics() {
        AuthMiddleware::requireAdmin();
        
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            
            // Get funnel data
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(DISTINCT session_id) as visitors,
                    COUNT(DISTINCT CASE WHEN event_type = 'product_view' THEN session_id END) as product_views,
                    COUNT(DISTINCT CASE WHEN event_type = 'add_to_cart' THEN session_id END) as add_to_carts,
                    COUNT(DISTINCT CASE WHEN event_type = 'checkout_started' THEN session_id END) as checkout_started,
                    COUNT(DISTINCT CASE WHEN event_type = 'purchase_completed' THEN session_id END) as purchases
                FROM analytics_events 
                WHERE created_at BETWEEN ? AND ?
            ");
            $stmt->execute([$startDate, $endDate]);
            $funnelData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Calculate conversion rates
            $visitors = $funnelData['visitors'] ?: 1;
            $funnelData['product_view_rate'] = round(($funnelData['product_views'] / $visitors) * 100, 2);
            $funnelData['cart_rate'] = round(($funnelData['add_to_carts'] / $visitors) * 100, 2);
            $funnelData['checkout_rate'] = round(($funnelData['checkout_started'] / $visitors) * 100, 2);
            $funnelData['purchase_rate'] = round(($funnelData['purchases'] / $visitors) * 100, 2);
            
            // Get most viewed products
            $stmt = $this->db->prepare("
                SELECT 
                    p.name,
                    p.id,
                    COUNT(*) as views
                FROM analytics_events ae
                JOIN products p ON JSON_UNQUOTE(JSON_EXTRACT(ae.event_data, '$.product_id')) = p.id
                WHERE ae.event_type = 'product_view' 
                AND ae.created_at BETWEEN ? AND ?
                GROUP BY p.id, p.name
                ORDER BY views DESC
                LIMIT 10
            ");
            $stmt->execute([$startDate, $endDate]);
            $mostViewed = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get cart abandonment rate
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(DISTINCT session_id) as sessions_with_cart,
                    COUNT(DISTINCT CASE WHEN event_type = 'purchase_completed' THEN session_id END) as sessions_with_purchase
                FROM analytics_events 
                WHERE created_at BETWEEN ? AND ?
                AND event_type IN ('add_to_cart', 'purchase_completed')
            ");
            $stmt->execute([$startDate, $endDate]);
            $cartData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $abandonmentRate = $cartData['sessions_with_cart'] > 0 ? 
                round((($cartData['sessions_with_cart'] - $cartData['sessions_with_purchase']) / $cartData['sessions_with_cart']) * 100, 2) : 0;
            
            // Get customer lifetime value
            $stmt = $this->db->prepare("
                SELECT 
                    AVG(total_spent) as avg_clv,
                    MAX(total_spent) as max_clv,
                    MIN(total_spent) as min_clv
                FROM (
                    SELECT 
                        u.id,
                        SUM(o.total_amount) as total_spent
                    FROM users u
                    JOIN orders o ON u.id = o.user_id
                    WHERE o.status != 'cancelled'
                    GROUP BY u.id
                ) customer_stats
            ");
            $stmt->execute();
            $clvData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success([
                'funnel' => $funnelData,
                'most_viewed_products' => $mostViewed,
                'cart_abandonment_rate' => $abandonmentRate,
                'customer_lifetime_value' => $clvData
            ]);
        } catch (Exception $e) {
            Response::error('Failed to get customer behavior analytics: ' . $e->getMessage());
        }
    }

    /**
     * Get inventory analytics
     */
    public function getInventoryAnalytics() {
        AuthMiddleware::requireAdmin();
        
        try {
            // Get low stock products
            $stmt = $this->db->query("
                SELECT 
                    p.id,
                    p.name,
                    p.stock,
                    c.name as category,
                    COALESCE(SUM(oi.quantity), 0) as total_sold
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
                WHERE p.stock <= 10 AND p.is_active = 1
                GROUP BY p.id, p.name, p.stock, c.name
                ORDER BY p.stock ASC
            ");
            $lowStock = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get out of stock products
            $stmt = $this->db->query("
                SELECT 
                    p.id,
                    p.name,
                    c.name as category,
                    COALESCE(SUM(oi.quantity), 0) as total_sold
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
                WHERE p.stock = 0 AND p.is_active = 1
                GROUP BY p.id, p.name, c.name
                ORDER BY total_sold DESC
            ");
            $outOfStock = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get inventory turnover
            $stmt = $this->db->query("
                SELECT 
                    p.id,
                    p.name,
                    p.stock,
                    COALESCE(SUM(oi.quantity), 0) as sold_last_30_days,
                    CASE 
                        WHEN COALESCE(SUM(oi.quantity), 0) > 0 
                        THEN ROUND(p.stock / (COALESCE(SUM(oi.quantity), 0) / 30), 2)
                        ELSE 999 
                    END as days_of_supply
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id 
                    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    AND o.status != 'cancelled'
                WHERE p.is_active = 1
                GROUP BY p.id, p.name, p.stock
                HAVING days_of_supply <= 30
                ORDER BY days_of_supply ASC
            ");
            $turnover = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get dead stock (no sales in last 90 days)
            $stmt = $this->db->query("
                SELECT 
                    p.id,
                    p.name,
                    p.stock,
                    p.price,
                    c.name as category
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id 
                    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                    AND o.status != 'cancelled'
                WHERE p.is_active = 1 
                AND p.stock > 0
                AND oi.order_id IS NULL
                ORDER BY p.stock DESC
            ");
            $deadStock = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate inventory health score
            $totalProducts = $this->db->query("SELECT COUNT(*) as count FROM products WHERE is_active = 1")->fetch()['count'];
            $lowStockCount = count($lowStock);
            $outOfStockCount = count($outOfStock);
            $deadStockCount = count($deadStock);
            
            $healthScore = $totalProducts > 0 ? 
                round((($totalProducts - $lowStockCount - $outOfStockCount - $deadStockCount) / $totalProducts) * 100, 2) : 100;
            
            Response::success([
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
                'turnover_analysis' => $turnover,
                'dead_stock' => $deadStock,
                'inventory_health_score' => $healthScore,
                'summary' => [
                    'total_products' => $totalProducts,
                    'low_stock_count' => $lowStockCount,
                    'out_of_stock_count' => $outOfStockCount,
                    'dead_stock_count' => $deadStockCount
                ]
            ]);
        } catch (Exception $e) {
            Response::error('Failed to get inventory analytics: ' . $e->getMessage());
        }
    }

    /**
     * Get conversion rate optimization data
     */
    public function getCROAnalytics() {
        AuthMiddleware::requireAdmin();
        
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            
            // Get conversion funnel with detailed breakdown
            $stmt = $this->db->prepare("
                SELECT 
                    DATE(ae.created_at) as date,
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'page_view' THEN ae.session_id END) as visitors,
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'product_view' THEN ae.session_id END) as product_views,
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'add_to_cart' THEN ae.session_id END) as add_to_carts,
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'checkout_started' THEN ae.session_id END) as checkout_started,
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'purchase_completed' THEN ae.session_id END) as purchases
                FROM analytics_events ae
                WHERE ae.created_at BETWEEN ? AND ?
                GROUP BY DATE(ae.created_at)
                ORDER BY date ASC
            ");
            $stmt->execute([$startDate, $endDate]);
            $dailyFunnel = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get device-specific conversion rates
            $stmt = $this->db->prepare("
                SELECT 
                    CASE 
                        WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
                        WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
                        ELSE 'Desktop'
                    END as device_type,
                    COUNT(DISTINCT session_id) as visitors,
                    COUNT(DISTINCT CASE WHEN event_type = 'purchase_completed' THEN session_id END) as purchases
                FROM analytics_events 
                WHERE created_at BETWEEN ? AND ?
                    AND event_type IN ('page_view', 'purchase_completed')
                GROUP BY device_type
            ");
            $stmt->execute([$startDate, $endDate]);
            $deviceData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate device conversion rates
            foreach ($deviceData as &$device) {
                $device['conversion_rate'] = $device['visitors'] > 0 ? 
                    round(($device['purchases'] / $device['visitors']) * 100, 2) : 0;
            }
            
            // Get products with high views but low conversions
            $stmt = $this->db->prepare("
                SELECT 
                    p.id,
                    p.name,
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'product_view' THEN ae.session_id END) as views,
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'purchase_completed' THEN ae.session_id END) as purchases,
                    ROUND(
                        COUNT(DISTINCT CASE WHEN ae.event_type = 'purchase_completed' THEN ae.session_id END) / 
                        NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'product_view' THEN ae.session_id END), 0) * 100, 
                        2
                    ) as conversion_rate
                FROM products p
                LEFT JOIN analytics_events ae ON JSON_UNQUOTE(JSON_EXTRACT(ae.event_data, '$.product_id')) = p.id
                    AND ae.event_type IN ('product_view', 'purchase_completed')
                    AND ae.created_at BETWEEN ? AND ?
                WHERE p.is_active = 1
                GROUP BY p.id, p.name
                HAVING views >= 10
                ORDER BY views DESC, conversion_rate ASC
                LIMIT 20
            ");
            $stmt->execute([$startDate, $endDate]);
            $productConversions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Generate optimization insights
            $insights = [];
            
            // Check for high cart abandonment
            $overallAbandonment = $this->getCartAbandonmentRate($startDate, $endDate);
            if ($overallAbandonment > 70) {
                $insights[] = "High cart abandonment rate ({$overallAbandonment}%). Consider optimizing checkout process.";
            }
            
            // Check for mobile conversion issues
            $mobileData = array_filter($deviceData, fn($d) => $d['device_type'] === 'Mobile');
            $desktopData = array_filter($deviceData, fn($d) => $d['device_type'] === 'Desktop');
            
            if (!empty($mobileData) && !empty($desktopData)) {
                $mobileConv = array_values($mobileData)[0]['conversion_rate'];
                $desktopConv = array_values($desktopData)[0]['conversion_rate'];
                
                if ($mobileConv < $desktopConv * 0.7) {
                    $insights[] = "Mobile users convert significantly less ({$mobileConv}% vs {$desktopConv}%). Optimize mobile experience.";
                }
            }
            
            // Check for low-converting popular products
            $lowConvertingProducts = array_filter($productConversions, fn($p) => $p['views'] >= 20 && $p['conversion_rate'] < 2);
            if (count($lowConvertingProducts) > 0) {
                $insights[] = count($lowConvertingProducts) . " popular products have low conversion rates. Review pricing or product pages.";
            }
            
            Response::success([
                'daily_funnel' => $dailyFunnel,
                'device_performance' => $deviceData,
                'product_conversions' => $productConversions,
                'optimization_insights' => $insights,
                'overall_metrics' => [
                    'cart_abandonment_rate' => $overallAbandonment
                ]
            ]);
        } catch (Exception $e) {
            Response::error('Failed to get CRO analytics: ' . $e->getMessage());
        }
    }

    /**
     * Export analytics data to CSV
     */
    public function exportAnalytics() {
        AuthMiddleware::requireAdmin();
        
        try {
            $type = $_GET['type'] ?? 'sales';
            $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            
            $filename = "analytics_{$type}_" . date('Y-m-d') . ".csv";
            
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            
            $output = fopen('php://output', 'w');
            
            switch ($type) {
                case 'sales':
                    $this->exportSalesData($output, $startDate, $endDate);
                    break;
                case 'inventory':
                    $this->exportInventoryData($output);
                    break;
                case 'products':
                    $this->exportProductsData($output, $startDate, $endDate);
                    break;
                default:
                    throw new Exception('Invalid export type');
            }
            
            fclose($output);
        } catch (Exception $e) {
            Response::error('Failed to export analytics: ' . $e->getMessage());
        }
    }

    /**
     * Update daily analytics summaries
     */
    public function updateDailySummaries() {
        AuthMiddleware::requireAdmin();
        
        try {
            $date = $_GET['date'] ?? date('Y-m-d');
            
            // Update sales summary
            $stmt = $this->db->prepare("CALL UpdateDailySalesSummary(?)");
            $stmt->execute([$date]);
            
            // Update product analytics
            $stmt = $this->db->prepare("CALL UpdateProductAnalytics(?)");
            $stmt->execute([$date]);
            
            // Update inventory analytics
            $stmt = $this->db->prepare("CALL UpdateInventoryAnalytics(?)");
            $stmt->execute([$date]);
            
            Response::success(['message' => 'Daily summaries updated successfully']);
        } catch (Exception $e) {
            Response::error('Failed to update summaries: ' . $e->getMessage());
        }
    }

    // Helper methods
    private function generateSessionId() {
        return uniqid('session_', true);
    }

    private function getCartAbandonmentRate($startDate, $endDate) {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(DISTINCT session_id) as sessions_with_cart,
                COUNT(DISTINCT CASE WHEN event_type = 'purchase_completed' THEN session_id END) as sessions_with_purchase
            FROM analytics_events 
            WHERE created_at BETWEEN ? AND ?
            AND event_type IN ('add_to_cart', 'purchase_completed')
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $data['sessions_with_cart'] > 0 ? 
            round((($data['sessions_with_cart'] - $data['sessions_with_purchase']) / $data['sessions_with_cart']) * 100, 2) : 0;
    }

    private function exportSalesData($output, $startDate, $endDate) {
        fputcsv($output, ['Date', 'Orders', 'Revenue', 'Customers', 'Avg Order Value']);
        
        $stmt = $this->db->prepare("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(total_amount) as revenue,
                COUNT(DISTINCT user_id) as customers,
                AVG(total_amount) as avg_order_value
            FROM orders 
            WHERE created_at BETWEEN ? AND ? 
            AND status != 'cancelled'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        $stmt->execute([$startDate, $endDate]);
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, $row);
        }
    }

    private function exportInventoryData($output) {
        fputcsv($output, ['Product', 'Category', 'Current Stock', 'Total Sold', 'Days of Supply']);
        
        $stmt = $this->db->query("
            SELECT 
                p.name,
                c.name as category,
                p.stock,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                CASE 
                    WHEN COALESCE(SUM(oi.quantity), 0) > 0 
                    THEN ROUND(p.stock / (COALESCE(SUM(oi.quantity), 0) / 30), 2)
                    ELSE 999 
                END as days_of_supply
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
            WHERE p.is_active = 1
            GROUP BY p.id, p.name, p.stock, c.name
            ORDER BY p.stock ASC
        ");
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, $row);
        }
    }

    private function exportProductsData($output, $startDate, $endDate) {
        fputcsv($output, ['Product', 'Views', 'Add to Carts', 'Purchases', 'Revenue', 'Conversion Rate']);
        
        $stmt = $this->db->prepare("
            SELECT 
                p.name,
                COUNT(DISTINCT CASE WHEN ae.event_type = 'product_view' THEN ae.session_id END) as views,
                COUNT(DISTINCT CASE WHEN ae.event_type = 'add_to_cart' THEN ae.session_id END) as add_to_carts,
                COUNT(DISTINCT CASE WHEN ae.event_type = 'purchase_completed' THEN ae.session_id END) as purchases,
                COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
                ROUND(
                    COUNT(DISTINCT CASE WHEN ae.event_type = 'purchase_completed' THEN ae.session_id END) / 
                    NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'product_view' THEN ae.session_id END), 0) * 100, 
                    2
                ) as conversion_rate
            FROM products p
            LEFT JOIN analytics_events ae ON JSON_UNQUOTE(JSON_EXTRACT(ae.event_data, '$.product_id')) = p.id
                AND ae.event_type IN ('product_view', 'add_to_cart', 'purchase_completed')
                AND ae.created_at BETWEEN ? AND ?
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id 
                AND o.created_at BETWEEN ? AND ? 
                AND o.status != 'cancelled'
            WHERE p.is_active = 1
            GROUP BY p.id, p.name
            ORDER BY views DESC
        ");
        $stmt->execute([$startDate, $endDate, $startDate, $endDate]);
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, $row);
        }
    }
}
