# eStore — Production Implementation Plan
## Full Audit + AI Code-Generation Prompts

**Stack:** React + TypeScript (Vite) | PHP custom MVC | MySQL | Shared Hosting (Hostinger)
**Backend base:** `/home/alien/Desktop/TOYS/backend/`
**Frontend base:** `/home/alien/Desktop/TOYS/src/`
**API base URL (frontend):** `http://localhost:8000/api` (defined in `src/services/api.ts` line 1)
**Last audit:** 2026-02-20 — Updated after implementation check

---

## How to Use This Document

Each section contains:
- What the problem is and where it lives in the code
- The exact fix required
- A **ready-to-paste AI prompt** that includes full context

Paste the prompt into any capable AI coding assistant along with the relevant file contents.
Work through phases **in order** — later phases depend on earlier ones.

---

## Current State — Updated Status Table

| Area | Status | Severity | Notes |
|------|--------|----------|-------|
| **Admin panel routes wired in App.tsx** | ❌ BROKEN | 🔴 CRITICAL | Pages exist, not connected |
| **Duplicate/orphan admin page files** | ❌ MESSY | 🔴 CRITICAL | Old + new versions coexist |
| **Payment system** | ❌ Absent | 🔴 CRITICAL | No controller, no gateway |
| **AuthContext /me call on boot** | ❌ Missing | 🟠 HIGH | JWT decoded locally only |
| **CORS wildcard fallback** | ⚠️ Risky | 🟡 MEDIUM | Falls back to `*` |
| **Email notifications** | ❌ Missing | 🟡 MEDIUM | No mailer anywhere |
| Frontend auth calls real API | ✅ Done | — | Real login/register/logout |
| JWT expiry check on boot | ✅ Done | — | Decodes payload locally |
| Checkout page | ✅ Done | — | `src/pages/CheckoutPage.tsx` |
| Cart synced to backend | ✅ Done | — | Uses API when logged in |
| AdminRoute guard | ✅ Done | — | `src/components/admin/AdminRoute.tsx` |
| AdminLayout with sidebar | ✅ Done | — | `src/components/admin/AdminLayout.tsx` |
| AdminDashboardPage | ✅ Done | — | `src/pages/admin/AdminDashboardPage.tsx` |
| AdminOrdersPage | ✅ Done | — | `src/pages/admin/AdminOrdersPage.tsx` |
| AdminProductsPage | ✅ Done | — | `src/pages/admin/AdminProductsPage.tsx` |
| AdminUsersPage | ✅ Done | — | `src/pages/admin/AdminUsersPage.tsx` |
| AdminSettingsPage | ✅ Done | — | `src/pages/admin/AdminSettingsPage.tsx` |
| GET /me backend endpoint | ✅ Done | — | `AuthController::getMe()` |
| Order.php SELECT FOR UPDATE | ✅ Done | — | Pessimistic lock on stock rows |
| Order.php atomic stock decrement | ✅ Done | — | rowCount() guard present |
| Order status state machine | ✅ Done | — | Valid transitions in AdminController |
| Audit log table + logging | ✅ Done | — | Writes to audit_logs on status change |
| SettingsController requireAdmin() | ✅ Done | — | Admin-only enforced |
| DB migration: stock CHECK constraint | ✅ Done | — | `migrations/001_add_constraints.sql` |
| DB migration: payments table | ✅ Done | — | Same migration file |
| DB migration: audit_logs table | ✅ Done | — | Same migration file |
| DB migration: idempotency_key | ✅ Done | — | Same migration file |
| DB migration: 'paid'/'refunded' enum | ✅ Done | — | Same migration file |

---

## What Remains — 4 Tasks

---

### Task 1 — Fix App.tsx: Wire Admin Sub-Routes (CRITICAL BLOCKER)

**File:** `src/App.tsx`

**Problem (confirmed by reading the file):**

The current `App.tsx` has this for admin routing:

```tsx
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
} />
```

`AdminLayout` contains `<Outlet />` but **no child routes are defined inside this `<Route>`**, so the Outlet renders nothing. Every admin URL shows the sidebar and a blank content area.

There is also a second problem: two sets of admin pages coexist in the project:

| Old files (imported in App.tsx) | New files (never imported) |
|--------------------------------|---------------------------|
| `src/pages/admin/DashboardPage.tsx` | `src/pages/admin/AdminDashboardPage.tsx` |
| `src/pages/admin/ProductsPage.tsx` | `src/pages/admin/AdminProductsPage.tsx` |
| `src/pages/admin/SettingsPage.tsx` | `src/pages/admin/AdminSettingsPage.tsx` |
| *(not present)* | `src/pages/admin/AdminOrdersPage.tsx` |
| *(not present)* | `src/pages/admin/AdminUsersPage.tsx` |

The new `Admin*.tsx` files are the correct, complete versions built per the implementation plan. The old `DashboardPage.tsx`, `ProductsPage.tsx`, `SettingsPage.tsx` are the older incomplete versions and should be deleted after wiring the new ones.

Also note: `AdminLoginPage` is imported from `'./pages/admin/LoginPage'` — this file exists and should stay.

**The fix is two steps:**
1. Replace the imports in App.tsx to use the new `Admin*Page` files
2. Add nested `<Route>` children inside the admin route so Outlet has something to render

---

**AI PROMPT — Task 1:**

```
You are fixing broken admin routing in a React TypeScript app using React Router v6.

FILE TO REWRITE: src/App.tsx

CURRENT FILE CONTENTS:
[paste the full current App.tsx here]

PROBLEM:
The /admin/* route wraps AdminLayout which contains <Outlet />, but no child routes are
defined inside the Route, so every admin URL shows only the sidebar with blank content.
Additionally, old incomplete admin pages are imported instead of the complete new ones.

FILES THAT EXIST (confirmed):
  src/pages/admin/AdminDashboardPage.tsx  ← complete, use this
  src/pages/admin/AdminOrdersPage.tsx     ← complete, use this
  src/pages/admin/AdminProductsPage.tsx   ← complete, use this
  src/pages/admin/AdminUsersPage.tsx      ← complete, use this
  src/pages/admin/AdminSettingsPage.tsx   ← complete, use this
  src/pages/admin/LoginPage.tsx           ← keep as-is (admin login page)
  src/pages/admin/DashboardPage.tsx       ← OLD, do not use
  src/pages/admin/ProductsPage.tsx        ← OLD, do not use
  src/pages/admin/SettingsPage.tsx        ← OLD, do not use

ALSO EXISTS (used correctly, keep unchanged):
  src/components/admin/AdminRoute.tsx
  src/components/admin/AdminLayout.tsx

REQUIREMENTS:

1. Remove imports of old admin pages: DashboardPage, ProductsPage, SettingsPage (the ones
   in pages/admin that do NOT have the Admin prefix).

2. Add imports for the new admin pages:
   import AdminDashboardPage from './pages/admin/AdminDashboardPage'
   import AdminOrdersPage from './pages/admin/AdminOrdersPage'
   import AdminProductsPage from './pages/admin/AdminProductsPage'
   import AdminUsersPage from './pages/admin/AdminUsersPage'
   import AdminSettingsPage from './pages/admin/AdminSettingsPage'
   (AdminLoginPage import stays exactly as-is — it's a different page)

3. Replace the admin route block with nested routes (React Router v6 syntax):

   <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
     <Route index element={<AdminDashboardPage />} />
     <Route path="orders" element={<AdminOrdersPage />} />
     <Route path="products" element={<AdminProductsPage />} />
     <Route path="users" element={<AdminUsersPage />} />
     <Route path="settings" element={<AdminSettingsPage />} />
   </Route>

   Keep the /admin/login route OUTSIDE and BEFORE the admin guard (unauthenticated access needed):
   <Route path="/admin/login" element={<AdminLoginPage />} />

4. Do not change ANY other routes (public routes, login, register, checkout, etc.).
   Do not change CartProvider/AuthProvider wrapping order.
   Do not change the Header/Footer structure for public routes.

5. Keep all existing non-admin imports exactly as they are.

Return the complete rewritten App.tsx.
```

---

### Task 2 — Delete Orphan Admin Files

**Files to delete after Task 1 is done:**

```
src/pages/admin/DashboardPage.tsx
src/pages/admin/DashboardPage.css
src/pages/admin/ProductsPage.tsx
src/pages/admin/ProductsPage.css
src/pages/admin/SettingsPage.tsx
src/pages/admin/SettingsPage.css
```

These are the older incomplete admin page files. Once App.tsx is updated to use the `Admin*Page.tsx` versions, these files are dead code. Remove them to avoid confusion.

**No AI prompt needed** — just delete those 6 files.

---

### Task 3 — AuthContext: Add /me Server Validation on Boot

**File:** `src/context/AuthContext.tsx`

**Problem:**

The current boot logic (lines 32–62) reads the JWT from localStorage, base64-decodes the payload, checks the `exp` field locally, and restores user state from `amanlove_user` in localStorage — all without contacting the server.

This means:
- If an admin revokes a user's account, that user stays logged in for up to 24 hours
- If a user's role is changed (e.g. promoted to admin or demoted), the frontend won't know until their JWT expires
- The user object restored from localStorage could be stale

The `/me` endpoint exists at `GET /api/me` (added to the backend). It validates the token server-side and returns the authoritative user object.

**Current boot flow (lines 32–62):**
```typescript
useEffect(() => {
  const savedUser = localStorage.getItem(AUTH_STORAGE_KEY)
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token && savedUser) {
    // decodes JWT locally, checks exp, restores from localStorage
  }
  setIsLoading(false)
}, [])
```

**Required change:** Call `GET /api/me` to verify the token server-side. If it succeeds, use the server-returned user. If it fails with 401, clear storage. If it fails with a network error, fall back to localStorage (tolerate offline).

---

**AI PROMPT — Task 3:**

```
You are improving the auth boot flow in a React TypeScript context.

FILE TO MODIFY: src/context/AuthContext.tsx

CURRENT FILE CONTENTS:
[paste the full current AuthContext.tsx here]

CHANGE REQUIRED:
Only modify the useEffect that runs on mount (the one with [] dependency).
Do not change login(), register(), logout(), updateUser(), or anything else.

CURRENT BOOT LOGIC (lines 32-62):
Reads JWT from localStorage, decodes payload locally, checks exp, restores user from
localStorage — never contacts the server.

NEW BOOT LOGIC:
1. Read token from localStorage under key 'auth_token'
2. If no token: setIsLoading(false) and return (user stays null)
3. If token exists:
   a. First check expiry locally (decode base64url middle segment, parse JSON, check exp * 1000 vs Date.now())
      If expired: clear both 'auth_token' and 'amanlove_user' from localStorage, setIsLoading(false), return
   b. If not expired: call GET http://localhost:8000/api/me
      Headers: { Authorization: 'Bearer ' + token }
   c. On HTTP 200 success:
      - Parse response JSON, shape: { success: true, data: { user: { id, email, first_name, last_name, role } } }
      - Construct user object: { id, name: first_name + ' ' + last_name, email, role }
      - setUser(user)
      - Save to localStorage 'amanlove_user' (overwrite stale data)
      - setIsLoading(false)
   d. On HTTP 401 or 403 (invalid/revoked token):
      - Clear 'auth_token' and 'amanlove_user' from localStorage
      - setUser(null)
      - setIsLoading(false)
   e. On network error (fetch throws — server unreachable):
      - Fall back: try reading 'amanlove_user' from localStorage and restore if present
      - setIsLoading(false)
      - Log the network error to console

CONSTRAINTS:
- Use native fetch, no axios or third-party HTTP libs
- Keep all existing constants (AUTH_STORAGE_KEY = 'amanlove_user', TOKEN_STORAGE_KEY = 'auth_token')
- Keep isLoading: boolean in state (it already exists)
- The rest of the file must remain unchanged
- Show only the new useEffect block, not the entire file (to keep the diff clear)
```

---

### Task 4 — Payment Integration (Moyasar — Saudi Market)

**Files to create:**
- `backend/controllers/PaymentController.php`
- `backend/utils/Moyasar.php`

**Files to modify:**
- `backend/routes/api.php` (add payment routes)
- `src/pages/CheckoutPage.tsx` (redirect to payment instead of directly creating order)

**Problem:**
Currently the checkout creates an order with status `pending` and that's it — no payment is taken. The database has a `payments` table (added in the migration) and the order status enum includes `paid` (added in the migration) but nothing ever writes to either.

**Chosen gateway:** Moyasar — the standard payment gateway for Saudi Arabia. They offer a hosted payment page (redirect flow) which is the simplest integration for shared hosting (no PCI compliance burden on your server).

**Integration flow:**
```
1. User fills checkout form
2. Frontend creates order → POST /api/orders → gets back order_id + total_amount
3. Frontend calls POST /api/payment/initiate with { order_id }
4. Backend returns { payment_url: "https://api.moyasar.com/v1/..." }
5. Frontend redirects: window.location.href = payment_url
6. User completes payment on Moyasar's hosted page
7. Moyasar redirects to: GET /api/payment/callback?id=PAY_xxx&status=paid&...
8. Backend verifies payment server-to-server with Moyasar API (do not trust redirect params)
9. On verified success: UPDATE order status to 'paid', INSERT into payments table
10. Backend redirects browser to: http://localhost:5173/orders?success=true&order_id={id}
11. Frontend /orders page detects the success param and shows a success banner
```

**Required .env variables to add:**
```
MOYASAR_SECRET_KEY=sk_test_...
MOYASAR_PUBLIC_KEY=pk_test_...
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

---

**AI PROMPT — Task 4A: Backend Payment Controller + Moyasar Utility:**

```
You are integrating Moyasar payment gateway into a PHP eCommerce backend.

PROJECT CONTEXT:
- PHP 8+, custom MVC, no framework
- Database: PDO singleton via Database::getInstance()->getConnection()
- Response helper: Response::success($data, $msg) and Response::error($msg, $code)
- Auth middleware: AuthMiddleware with requireAuth() method
- Routes registered in backend/routes/api.php
- .env file loaded via $config array in backend/config/config.php
  (access env vars as: $_ENV['MOYASAR_SECRET_KEY'] or getenv('MOYASAR_SECRET_KEY'))

EXISTING DATABASE TABLES (relevant ones):
  orders: id, user_id, total_amount, status (enum includes 'paid'), idempotency_key, ...
  payments: id, order_id, amount, currency, gateway, gateway_ref, status, raw_response, created_at, updated_at

TASK 1: Create backend/utils/Moyasar.php

Methods needed:

  buildPaymentUrl(float $amountSAR, int $orderId, string $callbackUrl, string $errorUrl): string
    - Moyasar hosted payment URL format:
      https://api.moyasar.com/v1/payments/initiate-hosted
      Query params:
        publishable_api_key = MOYASAR_PUBLIC_KEY
        amount = $amountSAR * 100 (halalas, integer)
        currency = SAR
        description = "Order #$orderId"
        callback_url = $callbackUrl
        error_url = $errorUrl
    - Return the full URL with query string

  verifyPayment(string $paymentId): array
    - Call Moyasar API: GET https://api.moyasar.com/v1/payments/{paymentId}
    - Auth: HTTP Basic auth with MOYASAR_SECRET_KEY as username, empty password
      (use curl with CURLOPT_USERPWD = "sk_test_xxx:")
    - Return decoded JSON response array
    - On curl error: throw new Exception("Moyasar API error: " . curl_error($ch))
    - Expected response shape: { id, status, amount, currency, source: {...}, created_at }

TASK 2: Create backend/controllers/PaymentController.php

Methods needed:

  initiatePayment():
    1. Call $this->auth->requireAuth() — get authenticated user
    2. Read body: { order_id: int }
    3. Validate order_id is present
    4. Fetch order from DB: SELECT id, user_id, total_amount, status FROM orders WHERE id = ?
    5. Verify order belongs to authenticated user (order.user_id === auth user_id)
    6. Verify order status is 'pending' (cannot initiate payment for already-paid/cancelled orders)
    7. Build URLs:
       $callbackUrl = BACKEND_URL . '/api/payment/callback'
       $errorUrl = FRONTEND_URL . '/checkout?error=payment_failed&order_id=' . $orderId
    8. Call Moyasar::buildPaymentUrl($order['total_amount'], $orderId, $callbackUrl, $errorUrl)
    9. Return Response::success(['payment_url' => $url, 'order_id' => $orderId], 'Payment initiated')

  handleCallback():
    - This is called by Moyasar redirect (GET request from browser), NOT a JSON endpoint
    - No auth required (Moyasar calls this)
    - Read query params: id (payment ID from Moyasar), status, message
    - IMPORTANT: Do NOT trust the status from the redirect — always verify server-to-server
    - Call Moyasar::verifyPayment($_GET['id'])
    - Check verified payment status:
      If 'paid':
        1. Extract order_id from payment description (or store it temporarily in a payments record created during initiate)
           Actually: store a pending payment record during initiatePayment(), then update it here using gateway_ref
           OR: pass order_id as part of the callback URL query param (simpler for now):
           $callbackUrl = BACKEND_URL . '/api/payment/callback?order_id=' . $orderId
           Then read $_GET['order_id'] here
        2. Update order: UPDATE orders SET status = 'paid' WHERE id = ? AND status = 'pending'
        3. Insert/update payments record:
           INSERT INTO payments (order_id, amount, currency, gateway, gateway_ref, status, raw_response)
           VALUES (?, ?, 'SAR', 'moyasar', ?, 'completed', ?)
           ON DUPLICATE KEY UPDATE status='completed', raw_response=?, gateway_ref=?
        4. Redirect to: FRONTEND_URL . '/orders?success=true&order_id=' . $orderId
      If failed/cancelled:
        1. Update order status back to appropriate state or leave as pending
        2. Redirect to: FRONTEND_URL . '/checkout?error=payment_failed&order_id=' . $orderId

TASK 3: Add to backend/routes/api.php:
  $paymentController = new PaymentController();
  $router->add('POST', '/payment/initiate', [$paymentController, 'initiatePayment']);
  $router->add('GET', '/payment/callback', [$paymentController, 'handleCallback']);
  Also add require_once for PaymentController at the top.

CONSTRAINTS:
- Use prepared statements for all DB queries
- Use curl for Moyasar API calls (no Guzzle or other HTTP libs)
- No new composer dependencies
- Keep it simple — this is shared hosting, no job queues or async processing
- Add error logging with error_log() for debugging

Return all three files/changes.
```

---

**AI PROMPT — Task 4B: Frontend Checkout Update:**

```
You are updating the checkout flow in a React TypeScript app to redirect to Moyasar payment.

FILE TO MODIFY: src/pages/CheckoutPage.tsx

CURRENT BEHAVIOR:
The form submits, calls apiService.createOrder(), then navigates to /orders.
This creates a cash-on-delivery order with status 'pending'.

NEW BEHAVIOR:
After creating the order, call a new payment initiate endpoint, then redirect
the browser to the Moyasar hosted payment page.

CURRENT FILE CONTENTS:
[paste the full current CheckoutPage.tsx here]

CHANGE REQUIRED:

1. After apiService.createOrder() succeeds and returns { order_id, total_amount }:

2. Call POST /api/payment/initiate:
   fetch('http://localhost:8000/api/payment/initiate', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
     },
     body: JSON.stringify({ order_id: result.order_id })
   })

3. On success, response contains { payment_url: string }:
   window.location.href = data.payment_url
   (This redirects the browser to Moyasar's hosted payment page)

4. On error from payment initiate: show error message "فشل في بدء الدفع — Payment initiation failed"
   Do NOT navigate away. Keep the order (it was created). Show the error with the order_id
   so the user knows their order exists: "تم إنشاء طلبك #{order_id}. يرجى المحاولة مرة أخرى."

5. Add a note below the submit button explaining payment flow:
   "ستُحال إلى صفحة الدفع الآمنة بعد تأكيد الطلب"
   (You will be redirected to the secure payment page after confirming the order)

6. Remove the old cash-on-delivery notice "الدفع عند الاستلام — Cash on Delivery" if present.

7. Update loading button text:
   - While creating order: "جاري إنشاء الطلب..."
   - While initiating payment: "جاري التحويل للدفع..."

Show only the changed section of the component (the submit handler and the button area).
Do not rewrite the entire file if most of it stays the same.
```

---

**AI PROMPT — Task 4C: Orders Page — Show Payment Success Banner:**

```
You are adding a success banner to the Orders page in a React TypeScript app.

FILE TO MODIFY: src/pages/OrdersPage.tsx

CONTEXT:
After a successful Moyasar payment, the browser is redirected to:
  /orders?success=true&order_id=123

The Orders page currently just lists the user's orders. It needs to detect these
URL parameters and show a success message.

CHANGE REQUIRED:

1. Import useSearchParams from react-router-dom (if not already imported)

2. On mount, check searchParams:
   const [searchParams] = useSearchParams()
   const isSuccess = searchParams.get('success') === 'true'
   const newOrderId = searchParams.get('order_id')

3. If isSuccess is true, show a green success banner at the top of the page:
   - Icon: checkmark circle (use a simple SVG or text emoji ✓)
   - Heading: "تم الدفع بنجاح!" (Payment successful!)
   - Subtext: "تم استلام طلبك #{newOrderId} وسيتم معالجته قريباً."
             (Your order #{newOrderId} has been received and will be processed soon.)
   - The banner should auto-dismiss after 8 seconds OR have an X close button
   - Style: green background (bg-green-50 border border-green-200), rounded-lg, p-4

4. Also check for error param from failed payment:
   const paymentError = searchParams.get('error')
   If paymentError === 'payment_failed': show a yellow warning banner:
   - "لم يكتمل الدفع. يمكنك المحاولة مرة أخرى من قائمة الطلبات."
   (Payment was not completed. You can try again from the orders list.)

Show only the changes needed — the banner JSX and the searchParams logic.
```

---

## Implementation Order (Remaining Work)

```
TODAY — Unblocks everything
  □ Task 1  Fix App.tsx admin routes (30 minutes — simple wiring fix)
  □ Task 2  Delete 6 orphan admin files (2 minutes)

THIS WEEK — Complete the auth boot
  □ Task 3  AuthContext /me server validation on boot

NEXT MILESTONE — Real payments
  □ Task 4A  PaymentController.php + Moyasar.php (backend)
  □ Task 4B  CheckoutPage.tsx — redirect to Moyasar
  □ Task 4C  OrdersPage.tsx — success/error banner

LATER — Nice to have
  □ CORS wildcard fix (backend/public/index.php)
  □ Email notifications (order confirmation, admin alert)
  □ Admin categories page (backend route exists, no frontend page)
```

---

## What Is Fully Done — No Action Needed

Everything below has been verified by reading the actual files:

**Backend:**
- JWT auth (HS256, timing-safe compare, 24h expiry)
- `GET /me` endpoint — validates token, returns authoritative user
- Bcrypt password hashing, password_verify()
- Rate limiting on login (10/5min) and register (5/15min)
- All prepared statements — no string-concatenated SQL
- Image upload: MIME validation, 5MB limit, filename sanitisation, 0644 permissions, WebP conversion
- `Order.php::create()` — `SELECT ... FOR UPDATE`, atomic decrement with rowCount() guard, full transaction
- Admin state machine: `pending → paid → processing → shipped → delivered / cancelled / refunded`
- Audit log writes on every order status change
- `SettingsController::updateSettings()` — `requireAdmin()` enforced
- DB migration file: stock CHECK constraint, payments table, audit_logs table, idempotency_key, enum extended

**Frontend:**
- `AuthContext.tsx` — real API login/register, JWT expiry check, clears both tokens on logout
- `CheckoutPage.tsx` — shipping form, calls real API, handles errors
- `CartContext.tsx` — localStorage for guests, backend API when authenticated, merges on login
- `AdminRoute.tsx` — redirects non-admins
- `AdminLayout.tsx` — sidebar with all nav links, Outlet
- `AdminDashboardPage.tsx` — stats cards, recent orders, low stock alerts
- `AdminOrdersPage.tsx` — order list, status filter, inline status updates with transition validation
- `AdminProductsPage.tsx` — full product CRUD, image upload, search/filter, grid/table view
- `AdminUsersPage.tsx` — user list, role management, self-change protection
- `AdminSettingsPage.tsx` — store info, social links, change tracking

---

## Context Block — Paste With Every AI Prompt

```
TECH STACK:
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS, React Router v6
- Backend: PHP 8+, PDO MySQL, custom MVC (no framework, no Composer dependencies)
- Hosting: Shared hosting (Hostinger), PHP + MySQL
- Store language: Arabic (RTL). Admin panel: English.

KEY FILE PATHS:
- Frontend entry:       src/main.tsx
- App router:          src/App.tsx
- API service:         src/services/api.ts  (base URL: http://localhost:8000/api)
- Auth context:        src/context/AuthContext.tsx
- Cart context:        src/context/CartContext.tsx
- Admin guard:         src/components/admin/AdminRoute.tsx
- Admin layout:        src/components/admin/AdminLayout.tsx
- Backend entry:       backend/public/index.php
- Router:              backend/routes/api.php
- DB utility:          backend/utils/Database.php  (PDO singleton)
- Response utility:    backend/utils/Response.php  (Response::success / Response::error)
- Auth middleware:      backend/middleware/AuthMiddleware.php  (requireAuth / requireAdmin)
- JWT utility:         backend/utils/JWT.php  (JWT::encode / JWT::decode)
- Order model:         backend/models/Order.php
- Admin controller:    backend/controllers/AdminController.php

BACKEND RESPONSE FORMAT:
  Success: { "success": true, "data": {...}, "message": "..." }
  Error:   { "success": false, "message": "..." }  + appropriate HTTP status code

CURRENCY: SAR (Saudi Riyal), sub-unit: halalas (1 SAR = 100 halalas)
AUTH TOKEN:     localStorage key 'auth_token'
USER OBJECT:    localStorage key 'amanlove_user'
CART (guest):   localStorage key 'amanlove_cart'
```
