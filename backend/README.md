# E-Commerce Backend API

## Setup

1. Import database schema:
```bash
mysql -u root -p < database/schema.sql
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Update .env with your database credentials

4. Point web server document root to `public/` directory

## API Endpoints

### Authentication
- POST /api/register
- POST /api/login

### Products
- GET /api/products
- GET /api/products/{id}
- POST /api/products (admin)
- PUT /api/products/{id} (admin)
- DELETE /api/products/{id} (admin)

### Cart
- POST /api/cart
- GET /api/cart/{userId}

### Orders
- POST /api/orders
- GET /api/orders/{userId}

### Reviews
- POST /api/reviews
- GET /api/products/{productId}/reviews

## Apache Configuration

Ensure mod_rewrite is enabled:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```
