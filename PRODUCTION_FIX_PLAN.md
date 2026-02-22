# 🛠️ Production Fix Plan — eCommerce System
## Project: /home/alien/Desktop/TOYS
## Stack: React (Vite) + PHP Backend + MySQL

> **How to use this plan:**
> Copy each prompt exactly into your AI model. Do them in order. Do NOT skip steps.
> Each prompt is self-contained and tells the model exactly what file to edit and what to do.

---

## ✅ PHASE 1 — Create Payments Table

### Why this is critical:
The file `backend/models/Payment.php` and `backend/controllers/PaymentController.php` both exist and reference a `payments` table. But that table is **never created** in `backend/database/schema.sql`. Every payment call will crash with a MySQL error.

---

### 📌 Task 1.1 — Create the payments table migration file

**Prompt:**
```
You are working on a PHP eCommerce backend located at /home/alien/Desktop/TOYS/backend/

The database schema is at: backend/database/schema.sql
Existing migrations are in: backend/migrations/

The payments table is missing from the database. The Payment model at backend/models/Payment.php references these columns:
- id (INT AUTO_INCREMENT PRIMARY KEY)
- order_id (INT NOT NULL, FK to orders.id ON DELETE CASCADE)
- amount (DECIMAL(10,2) NOT NULL)
- currency (VARCHAR(10) DEFAULT 'KWD')
- gateway (ENUM: 'moyasar', 'stripe', 'cod')
- gateway_ref (VARCHAR(255) NULLABLE)
- status (ENUM: 'pending', 'completed', 'failed', 'refunded' DEFAULT 'pending')
- raw_response (TEXT NULLABLE)
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

Also add these indexes:
- idx_order_id on order_id
- idx_status on status
- idx_gateway on gateway
- idx_created_at on created_at

Task:
1. Create a new file: backend/migrations/006_create_payments_table.sql
2. Write a complete CREATE TABLE IF NOT EXISTS statement for the payments table with all columns, constraints, and indexes listed above.
3. Add a UNIQUE constraint on gateway_ref to prevent duplicate payment records.
4. Use ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

Do NOT modify any existing files. Only create the new migration file.
```

---

### 📌 Task 1.2 — Fix the currency default in Payment model

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/models/Payment.php

In the create() method, the currency defaults to 'SAR' (Saudi Riyal):
    ':currency' => $data['currency'] ?? 'SAR',

Also in the getStatistics() method, the currency field is used in GROUP BY without a default.

Also open: backend/controllers/PaymentController.php

In the createPaymentIntent() method, the currency is hardcoded as 'SAR':
    'currency' => 'SAR',

Task:
1. In backend/models/Payment.php — change the default currency from 'SAR' to 'KWD' in the create() method
2. In backend/controllers/PaymentController.php — change the hardcoded 'SAR' to 'KWD' in the createPaymentIntent() method
3. Do not change anything else in either file.
```

---

### 📌 Task 1.3 — Prevent duplicate payments per order

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/controllers/PaymentController.php

In the createPaymentIntent() method, after the order is fetched and validated (around line 41 where it checks order status), there is NO check to prevent creating a second payment for an order that already has a pending or completed payment.

This means a user could call the endpoint twice and create duplicate payment records for the same order.

Task:
Add a check AFTER the existing order status check (after line 43) that:
1. Queries the payments table: SELECT id, status FROM payments WHERE order_id = ? AND status IN ('pending', 'completed') LIMIT 1
2. Uses $this->paymentModel->db (note: the db property is private in Payment model, so instead use the Database singleton: require_once and use Database::getInstance()->getConnection())
3. If a payment already exists with status 'pending' or 'completed', return Response::error('A payment already exists for this order', 409)
4. Add the require_once for Database.php at the top of PaymentController.php if not already present

Only modify backend/controllers/PaymentController.php. Keep all existing logic intact.
```

---

## ✅ PHASE 2 — Fix Stock Race Conditions

### Why this is critical:
The cart controller (`backend/controllers/CartController.php`) checks stock before adding items, but does NOT lock the row. Between the check and the insert, another request can buy the last item. This causes overselling.

---

### 📌 Task 2.1 — Fix addToCart race condition

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/controllers/CartController.php

In the addToCart() method (around line 34), the current logic is:
1. SELECT stock, is_active FROM products WHERE id = ? (no lock)
2. Check if stock >= quantity
3. INSERT INTO cart ... ON DUPLICATE KEY UPDATE quantity = quantity + ?

The problem: between step 1 and step 3, another request could reduce the stock. Also, when using ON DUPLICATE KEY UPDATE, the new total quantity (existing + added) is never checked against stock.

Task — rewrite the addToCart() method body (keep the method signature the same) to:
1. Start a database transaction: $this->db->beginTransaction()
2. Use SELECT stock, is_active FROM products WHERE id = ? FOR UPDATE (row-level lock)
3. Check if product exists, is active, and stock >= $data['quantity']
4. Also check: if the product is already in cart, fetch the existing cart quantity first:
   SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?
   Then validate that (existing_quantity + new_quantity) <= stock
5. Do the INSERT ... ON DUPLICATE KEY UPDATE
6. Commit the transaction
7. Wrap everything in try/catch, rollback on exception

Keep all existing validation (Validator::integer, Validator::quantity checks) before the transaction starts.
Only modify the addToCart() method. Do not change other methods.
```

---

### 📌 Task 2.2 — Fix updateCartItem race condition

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/controllers/CartController.php

In the updateCartItem() method (around line 82), the current logic is:
1. SELECT product_id FROM cart WHERE id = ? AND user_id = ? (no transaction)
2. SELECT stock FROM products WHERE id = ? (no lock)
3. Check stock >= quantity
4. UPDATE cart SET quantity = ?

The problem: no transaction wraps these steps, so stock can change between check and update.

Task — rewrite the updateCartItem() method body to:
1. Keep the existing Validator::quantity check at the top
2. Start a transaction: $this->db->beginTransaction()
3. SELECT product_id FROM cart WHERE id = ? AND user_id = ? (inside transaction)
4. If not found, rollback and return 404
5. SELECT stock FROM products WHERE id = ? FOR UPDATE (row lock)
6. If stock < $data['quantity'], rollback and return error 'Insufficient stock'
7. UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?
8. Commit
9. Wrap in try/catch, rollback on exception

Only modify the updateCartItem() method. Do not change other methods.
```

---

### 📌 Task 2.3 — Add stock validation to cart merge on login

**Prompt:**
```
You are working on a React TypeScript frontend at /home/alien/Desktop/TOYS/src/

Open the file: src/context/CartContext.tsx

In the syncCart function inside the useEffect (around line 122), when a user logs in, the code merges the local guest cart into the server cart by calling apiService.addToCart() for each local item. 

The problem: if a guest added 5 items to cart but only 2 are in stock now, the merge silently fails per item but the local cart still shows 5.

Task:
In the catch block of the inner try/catch (around line 141 where it says 'Failed to sync item to server'), after logging the error, also remove that item from the local cart state by filtering it out from localCart.items before the final dispatch.

Specifically:
1. Create a variable: let mergedItems: CartItem[] = []
2. For each localItem, try to add to server. If it succeeds, add it to mergedItems. If it fails, skip it (don't add to mergedItems).
3. After the loop, instead of fetching the server cart again, dispatch SET_CART with the successfully merged items mapped from the server response.

Actually, the cleanest fix: after the merge loop, always re-fetch the server cart to get the authoritative state. The re-fetch is already done implicitly — just make sure the final dispatch uses the server cart data, not the local data.

Change only the syncCart function. Do not modify anything else in CartContext.tsx.
```

---

## ✅ PHASE 3 — Fix Order Status Enum Values

### Why this is critical:
The `orders` table in `schema.sql` has status ENUM as `('pending', 'processing', 'shipped', 'delivered', 'cancelled')`. But migration `005_update_orders_status.sql` changes it to `('pending', 'processed', 'shipping', 'delivered', 'cancelled')`. And `Order.php updateStatus()` validates against `['pending', 'processing', 'shipping', 'delivered', 'cancelled']`. These three are inconsistent with each other AND with the PaymentController which calls `updateStatus($orderId, 'processing')`. This will cause silent failures.

---

### 📌 Task 3.1 — Standardize order status values across all files

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

There is a critical inconsistency in order status values across these files:
- backend/database/schema.sql — ENUM: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
- backend/migrations/005_update_orders_status.sql — changes to: 'pending', 'processed', 'shipping', 'delivered', 'cancelled'
- backend/models/Order.php updateStatus() — validates against: ['pending', 'processing', 'shipping', 'delivered', 'cancelled']
- backend/controllers/PaymentController.php — calls updateStatus($orderId, 'processing')

The correct canonical set of statuses must be:
  'pending'    → order created, not yet paid
  'paid'       → payment confirmed
  'processing' → being prepared/packed
  'shipped'    → dispatched to courier
  'delivered'  → received by customer
  'cancelled'  → cancelled
  'refunded'   → money returned

Task — make these exact changes:

1. In backend/database/schema.sql:
   Find the orders table CREATE statement and change the status ENUM line to:
   status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',

2. In backend/models/Order.php in the updateStatus() method:
   Find the $validStatuses array and replace it with:
   $validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

3. In backend/controllers/PaymentController.php:
   - In createCashOnDeliveryPayment() method: change updateStatus($order['id'], 'processing') to updateStatus($order['id'], 'paid')
   - In moyasarCallback() method: change updateStatus($orderId, 'processing') to updateStatus($orderId, 'paid')
   - In stripeWebhook() method: change updateStatus($orderId, 'processing') to updateStatus($orderId, 'paid')

4. Create a new file: backend/migrations/007_fix_order_status_enum.sql with:
   ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending';
   UPDATE orders SET status = 'processing' WHERE status = 'processed';
   UPDATE orders SET status = 'shipped' WHERE status = 'shipping';

Make all 4 changes. Do not change anything else.
```

---

### 📌 Task 3.2 — Add state machine guard to order status transitions

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/models/Order.php

In the updateStatus() method, currently ANY status can transition to ANY other status. For example, a 'delivered' order could be set back to 'pending'. This is wrong.

Task — add a state machine transition guard inside the updateStatus() method.

After the line that fetches $oldStatus (after $oldStatus = $order['status'];), add this validation block:

$allowedTransitions = [
    'pending'    => ['paid', 'cancelled'],
    'paid'       => ['processing', 'cancelled', 'refunded'],
    'processing' => ['shipped', 'cancelled'],
    'shipped'    => ['delivered'],
    'delivered'  => ['refunded'],
    'cancelled'  => [],
    'refunded'   => []
];

if (!isset($allowedTransitions[$oldStatus]) || !in_array($newStatus, $allowedTransitions[$oldStatus])) {
    throw new Exception("Invalid status transition from '{$oldStatus}' to '{$newStatus}'");
}

Place this block BEFORE the existing $validStatuses check. Remove the $validStatuses check entirely since the transition map already enforces valid values.

Only modify the updateStatus() method in backend/models/Order.php. Do not change anything else.
```

---

## ✅ PHASE 4 — Implement CSRF Protection

### Why this is critical:
The backend at `backend/public/index.php` has no CSRF protection. State-changing requests (POST, PUT, DELETE) can be forged by malicious sites. The CORS config has a wildcard fallback (`Access-Control-Allow-Origin: *`) which makes this worse.

---

### 📌 Task 4.1 — Fix the CORS wildcard fallback

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/public/index.php

Currently the CORS logic is:
    if (in_array($origin, $config['cors']['allowed_origins'])) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header('Access-Control-Allow-Origin: *'); // Fallback for development
    }

The fallback 'Access-Control-Allow-Origin: *' is a critical security vulnerability in production. It allows any website to make requests to this API.

Task:
Replace the entire CORS block with:

    if (!empty($origin) && in_array($origin, $config['cors']['allowed_origins'])) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    } else {
        // Reject unknown origins — do not send CORS headers
        // Browser will block the request automatically
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(403);
            exit;
        }
    }

Also on the same file, find these two lines and uncomment them (remove the // from each line):
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
And replace them with:
    error_reporting(0);
    ini_set('display_errors', 0);

This prevents PHP errors from leaking internal information to clients.

Also uncomment the set_error_handler and set_exception_handler blocks (remove the /* */ or // comment markers around them).

Only modify backend/public/index.php. Do not change any other file.
```

---

### 📌 Task 4.2 — Add CSRF token generation and validation middleware

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

This API uses JWT Bearer tokens for authentication (see backend/middleware/AuthMiddleware.php). Since it's a stateless REST API with JWT, traditional session-based CSRF tokens don't apply directly. However, we need to protect against CSRF for non-authenticated endpoints and add the SameSite protection pattern.

Task — create a new file: backend/middleware/CsrfMiddleware.php with this exact content:

<?php

class CsrfMiddleware {
    /**
     * For JWT-based APIs, CSRF is mitigated by:
     * 1. Checking Content-Type is application/json (browsers can't send this cross-origin without preflight)
     * 2. Verifying the Authorization header exists for state-changing requests
     * 3. Rejecting requests with no Origin or Referer on state-changing endpoints
     */
    public static function validate() {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        
        // Only validate state-changing methods
        if (!in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            return true;
        }
        
        // Webhook endpoints are exempt (they use their own signature verification)
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        $exemptPaths = ['/api/payments/moyasar/callback', '/api/payments/stripe/webhook'];
        foreach ($exemptPaths as $path) {
            if (strpos($uri, $path) !== false) {
                return true;
            }
        }
        
        // Enforce JSON content type for all state-changing requests
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') === false) {
            // Allow multipart for file uploads
            if (strpos($contentType, 'multipart/form-data') === false) {
                http_response_code(415);
                echo json_encode(['success' => false, 'message' => 'Content-Type must be application/json']);
                exit;
            }
        }
        
        // Check Origin or Referer header is present and from allowed origin
        $config = require __DIR__ . '/../config/config.php';
        $allowedOrigins = $config['cors']['allowed_origins'];
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        
        if (!empty($origin)) {
            if (!in_array($origin, $allowedOrigins)) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden: invalid origin']);
                exit;
            }
        } elseif (!empty($referer)) {
            $refererHost = parse_url($referer, PHP_URL_HOST);
            $allowed = false;
            foreach ($allowedOrigins as $allowedOrigin) {
                if (strpos($allowedOrigin, $refererHost) !== false) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden: invalid referer']);
                exit;
            }
        }
        // If neither Origin nor Referer is present, allow (curl/mobile apps)
        // JWT token still protects authenticated endpoints
        
        return true;
    }
}

Then open backend/public/index.php and:
1. Add require_once __DIR__ . '/../middleware/CsrfMiddleware.php'; after the existing require for the router
2. Add CsrfMiddleware::validate(); call AFTER the OPTIONS check block and BEFORE the router dispatch

Only create the new file and modify backend/public/index.php.
```

---

## ✅ PHASE 5 — Add Database Constraints

### Why this is critical:
The database has no CHECK constraints preventing negative prices, zero stock, or invalid totals. A bug or malicious input could insert `price = -99` or `stock = -1000` directly into the database, bypassing PHP validation.

---

### 📌 Task 5.1 — Add CHECK constraints and missing indexes

**Prompt:**
```
You are working on a MySQL database for a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

The schema file is at: backend/database/schema.sql

Task — create a new migration file: backend/migrations/008_add_db_constraints.sql

Write the following SQL in that file:

-- ============================================
-- Constraint: price must be greater than 0
-- ============================================
ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price > 0);

-- ============================================
-- Constraint: stock must be 0 or more (never negative)
-- ============================================
ALTER TABLE products ADD CONSTRAINT chk_stock_non_negative CHECK (stock >= 0);

-- ============================================
-- Constraint: order total must be greater than 0
-- ============================================
ALTER TABLE orders ADD CONSTRAINT chk_order_total_positive CHECK (total_amount > 0);

-- ============================================
-- Constraint: order_items quantity must be at least 1
-- ============================================
ALTER TABLE order_items ADD CONSTRAINT chk_item_quantity_positive CHECK (quantity > 0);

-- ============================================
-- Constraint: order_items price must be greater than 0
-- ============================================
ALTER TABLE order_items ADD CONSTRAINT chk_item_price_positive CHECK (price > 0);

-- ============================================
-- Constraint: cart quantity must be at least 1
-- ============================================
ALTER TABLE cart ADD CONSTRAINT chk_cart_quantity_positive CHECK (quantity > 0);

-- ============================================
-- Constraint: payment amount must be greater than 0
-- ============================================
ALTER TABLE payments ADD CONSTRAINT chk_payment_amount_positive CHECK (amount > 0);

-- ============================================
-- Missing index: orders.created_at for date range queries
-- ============================================
ALTER TABLE orders ADD INDEX idx_created_at (created_at);

-- ============================================
-- Missing index: products.price for price range filtering
-- ============================================
ALTER TABLE products ADD INDEX idx_price (price);

-- ============================================
-- Missing index: products.stock for low-stock queries
-- ============================================
ALTER TABLE products ADD INDEX idx_stock (stock);

-- ============================================
-- Missing index: payments.order_id
-- ============================================
ALTER TABLE payments ADD INDEX idx_payment_order (order_id);

Note: MySQL 8.0+ supports CHECK constraints. If using MySQL 5.7, the CHECK constraints will be parsed but ignored — in that case, the PHP-level validation in Validator.php is the only guard.

Create only the migration file. Do not modify any existing files.
```

---

### 📌 Task 5.2 — Add server-side price validation in Product controller

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/controllers/ProductController.php

Find the create() method and the update() method.

Currently, the price field is passed directly from user input to the Product model without validating that it is greater than zero. The Validator::price() method in backend/utils/Validator.php only checks >= 0 (allows zero price).

Task — make these changes:

1. In backend/utils/Validator.php:
   Find the price() method:
       public static function price($value) {
           return is_numeric($value) && $value >= 0;
       }
   Change it to:
       public static function price($value) {
           return is_numeric($value) && $value > 0;
       }

2. In backend/controllers/ProductController.php:
   In the create() method, find where price is validated or used and add this check before the model call:
       if (!Validator::price($data['price'])) {
           Response::error('Price must be a positive number greater than zero', 400);
       }
   
   In the update() method, add the same check for price.

3. In backend/controllers/ProductController.php:
   In the create() method, add a stock validation:
       if (isset($data['stock']) && (!is_numeric($data['stock']) || (int)$data['stock'] < 0)) {
           Response::error('Stock cannot be negative', 400);
       }
   Add the same check in the update() method.

Only modify backend/utils/Validator.php and backend/controllers/ProductController.php.
```

---

## ✅ PHASE 6 — Rate Limiting on Checkout + Error Hardening

### 📌 Task 6.1 — Add rate limiting to checkout and payment endpoints

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

The RateLimiter class is at: backend/middleware/RateLimiter.php
It is already used in AuthController.php for login and register.

Task — add rate limiting to two controllers:

1. Open backend/controllers/OrderController.php
   At the top of the create() method (before $user = AuthMiddleware::authenticate()), add:
       $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
       RateLimiter::check('order_create_' . $ip, 10, 60); // 10 orders per hour per IP
   Also add require_once at the top of the file:
       require_once __DIR__ . '/../middleware/RateLimiter.php';

2. Open backend/controllers/PaymentController.php
   At the top of the createPaymentIntent() method (before $user = AuthMiddleware::authenticate()), add:
       $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
       RateLimiter::check('payment_create_' . $ip, 20, 60); // 20 payment attempts per hour per IP
   Also add require_once at the top of the file:
       require_once __DIR__ . '/../middleware/RateLimiter.php';

Only modify backend/controllers/OrderController.php and backend/controllers/PaymentController.php.
```

---

### 📌 Task 6.2 — Harden error exposure in production

**Prompt:**
```
You are working on a PHP eCommerce backend at /home/alien/Desktop/TOYS/backend/

Open the file: backend/public/index.php

Currently these lines exist:
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

And the error handler and exception handler blocks are commented out.

Task:
1. Replace:
       error_reporting(E_ALL);
       ini_set('display_errors', 1);
   With:
       error_reporting(0);
       ini_set('display_errors', 0);
       ini_set('log_errors', 1);
       ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

2. Uncomment the set_error_handler block (remove the // comment markers from each line inside it)

3. Uncomment the set_exception_handler block (remove the // comment markers from each line inside it)

4. Create the logs directory if it doesn't exist by adding this line before the error handler:
       if (!is_dir(__DIR__ . '/../logs')) { mkdir(__DIR__ . '/../logs', 0755, true); }

Only modify backend/public/index.php.
```

---

## 📋 EXECUTION CHECKLIST

Run these SQL migrations in order after all code changes are done:

```
1. backend/migrations/006_create_payments_table.sql
2. backend/migrations/007_fix_order_status_enum.sql
3. backend/migrations/008_add_db_constraints.sql
```

**Run command:**
```bash
mysql -u ecommerce_user -p ecommerce_db < backend/migrations/006_create_payments_table.sql
mysql -u ecommerce_user -p ecommerce_db < backend/migrations/007_fix_order_status_enum.sql
mysql -u ecommerce_user -p ecommerce_db < backend/migrations/008_add_db_constraints.sql
```

---

## ⚠️ IMPORTANT NOTES FOR YOUR AI MODEL

- Tell your model to **read the file first** before editing it
- Tell your model to **not change anything outside the specified methods**
- If the model gets confused, paste the relevant file content directly into the prompt
- Do tasks in order — later tasks depend on earlier ones (especially Phase 3 before Phase 6)
- After each task, verify the file was saved correctly before moving to the next

---

## 🎯 EXPECTED OUTCOME AFTER ALL PHASES

| Issue | Before | After |
|-------|--------|-------|
| Payments table | Missing — crashes | Created with constraints |
| Stock race conditions | Overselling possible | Row-locked transactions |
| Order status enum | Inconsistent across 4 files | Unified 7-value enum |
| CSRF protection | None | Origin validation + Content-Type enforcement |
| DB constraints | None | CHECK constraints on all money/quantity fields |
| Error exposure | PHP errors visible to client | Logged, never exposed |
| Rate limiting | Only on auth | On auth + orders + payments |

**Risk Level after fixes: 3/10 (down from 7/10)**
**Production Readiness after fixes: 7/10 (up from 4/10)**
