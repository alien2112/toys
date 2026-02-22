# Backend Setup Instructions

## 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

This will:
- Create the `ecommerce_db` database
- Create all required tables (users, products, categories, orders, order_items, reviews, cart)
- Seed initial data including:
  - 4 categories (سيارات, بالونات, ديناصورات, فضاء)
  - 12 products with Arabic names and descriptions
  - 2 test users (admin@example.com and user@example.com, both with password: "password")
  - 8 sample reviews

## 2. Environment Configuration

```bash
cp .env.example .env
```

Update `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USER=root
DB_PASS=your_password

JWT_SECRET=your-secret-key-change-in-production
```

## 3. Web Server Configuration

### Apache

1. Enable mod_rewrite:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

2. Configure virtual host to point document root to `backend/public/`

3. Ensure `.htaccess` is enabled in Apache config

### PHP Built-in Server (Development Only)

```bash
cd backend/public
php -S localhost:8000
```

## 4. Test the API

```bash
# Get all products
curl http://localhost:8000/api/products

# Get single product
curl http://localhost:8000/api/products/1

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## 5. Frontend Configuration

Update frontend to use API:
- API base URL: `http://localhost:8000/api`
- All mock data replaced with API calls
- JWT token stored in localStorage

## Default Credentials

- Admin: admin@example.com / password
- User: user@example.com / password
