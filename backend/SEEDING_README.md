# Database Seeding Guide

This directory contains comprehensive seeding scripts for populating your e-commerce backend with data from your Excel files.

## 📁 Files Overview

### Core Seeders
- **`seed_excel_data.php`** - Data parser for Excel files
- **`seed_products.php`** - Product seeder with category mapping
- **`seed_users.php`** - User seeder with profile support
- **`seed_product_images.php`** - Product image downloader (existing)

### Master Scripts
- **`seed_all.sh`** - Master seeder script (recommended)
- **`run_seeder.sh`** - Legacy image seeder script

## 🚀 Quick Start

### Basic Seeding
```bash
cd backend
./seed_all.sh
```

### Complete Reseed (Recommended for first time)
```bash
cd backend
./seed_all.sh --all
```

### Individual Operations
```bash
# Seed only users and products
./seed_all.sh --clear

# Seed with images
./seed_all.sh --images

# Seed with sample orders
./seed_all.sh --orders

# Clear everything and seed all data
./seed_all.sh --all
```

## 📊 Data Sources

The seeder reads from your Excel files in the `../seeding-data/` directory:

- **`الالعاب والدراجات محدث (1).xlsx`** - Product data
- **`المواليد محدث (1).xlsx`** - User data

## 🎯 Features

### Product Seeder
- ✅ Automatic category mapping
- ✅ Duplicate detection (updates existing products)
- ✅ Featured product support
- ✅ Stock management
- ✅ Arabic product names and descriptions

### User Seeder
- ✅ Password hashing
- ✅ Profile data (phone, address, birth date)
- ✅ Sample order generation
- ✅ Admin user protection (won't delete admin accounts)

### Image Seeder
- ✅ Automatic image download
- ✅ Multiple images per product
- ✅ Arabic alt text support
- ✅ Local file management

## 🔧 Configuration

### Database Settings
Make sure your `.env` file is configured:
```env
DB_HOST=localhost
DB_NAME=ecommerce_db
DB_USER=root
DB_PASS=
```

### Excel Data Structure
The seeder expects the following structure:

#### Products (`الالعاب والدراجات محدث (1).xlsx`)
```php
[
    'name' => 'Product Name',
    'slug' => 'product-slug',
    'description' => 'Product description',
    'price' => 99.99,
    'category' => 'Category Name',
    'stock' => 10,
    'is_featured' => true/false,
    'sku' => 'SKU-001',
    'brand' => 'Brand Name',
    'age_group' => 'Age Group'
]
```

#### Users (`المواليد محدث (1).xlsx`)
```php
[
    'first_name' => 'First Name',
    'last_name' => 'Last Name',
    'email' => 'email@example.com',
    'password' => 'password',
    'phone' => '+965 1234 5678',
    'address' => 'Address',
    'birth_date' => '1990-01-01'
]
```

## 🗃️ Database Tables Created/Modified

### Existing Tables
- `users` - User accounts
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `reviews` - Product reviews
- `cart` - Shopping cart
- `settings` - Store settings
- `product_images` - Product images

### New Tables (if not exists)
- `user_profiles` - Extended user information

## 🔐 Default Credentials

After seeding, you can login with:
- **Email:** `admin@example.com`
- **Password:** `password`

## 📈 Sample Data Statistics

When using `--all` option, the seeder creates:
- **5+** Sample users with profiles
- **10+** Products across 4 categories
- **Multiple** Product images per product
- **Sample** Orders with realistic data
- **Reviews** for products

## 🛠️ Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
chmod +x seed_all.sh
```

#### 2. PHP Not Found
Install PHP:
```bash
# Ubuntu/Debian
sudo apt install php php-mysql php-curl

# macOS
brew install php
```

#### 3. Database Connection Failed
Check your `.env` file and database server:
```bash
# Test database connection
mysql -u root -p -e "SHOW DATABASES;"
```

#### 4. Excel Files Not Found
Ensure Excel files are in the correct location:
```bash
ls -la ../seeding-data/
```

### Reset Database
To completely reset and reseed:
```bash
./seed_all.sh --all
```

### Individual Seeder Testing
Test individual seeders:
```bash
# Test products only
php seed_products.php

# Test users only
php seed_users.php --orders

# Test images only
php seed_product_images.php
```

## 🔄 Updating Data

### Adding New Products
1. Update your Excel file
2. Run the seeder: `./seed_all.sh`
3. New products will be added, existing ones updated

### Adding New Users
1. Update your Excel file
2. Run the seeder: `./seed_all.sh`
3. New users will be added, existing ones updated

### Updating Images
```bash
./seed_all.sh --images
```

## 📝 Notes

- The seeder is **idempotent** - running it multiple times won't create duplicates
- Admin users are **protected** and won't be deleted during clear operations
- Images are downloaded from **Lorempicsum** with consistent seeds
- All data supports **Arabic** content
- The seeder creates **realistic sample data** for testing

## 🚀 Production Usage

For production deployment:
1. Backup your database first
2. Use `--clear` only if you want to reset data
3. Test in staging environment first
4. Monitor disk space for images

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify file permissions and paths
3. Ensure database is running
4. Check PHP error logs: `tail -f /var/log/php_errors.log`
