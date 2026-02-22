#!/bin/bash

echo "🚀 Starting Complete Database Seeding..."
echo "======================================"

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed or not in PATH"
    exit 1
fi

# Change to backend directory
cd "$(dirname "$0")"

# Function to run a seeder
run_seeder() {
    local seeder_file=$1
    local seeder_name=$2
    local options=$3
    
    echo ""
    echo "📂 Running $seeder_name seeder..."
    echo "--------------------------------"
    
    if [ -f "$seeder_file" ]; then
        php "$seeder_file" $options
        if [ $? -eq 0 ]; then
            echo "✅ $seeder_name seeder completed successfully"
        else
            echo "❌ $seeder_name seeder failed"
            return 1
        fi
    else
        echo "⚠️  Seeder file not found: $seeder_file"
        return 1
    fi
}

# Parse command line arguments
CLEAR_ALL=false
WITH_IMAGES=false
WITH_ORDERS=false

for arg in "$@"; do
    case $arg in
        --clear)
            CLEAR_ALL=true
            ;;
        --images)
            WITH_IMAGES=true
            ;;
        --orders)
            WITH_ORDERS=true
            ;;
        --all)
            CLEAR_ALL=true
            WITH_IMAGES=true
            WITH_ORDERS=true
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --clear      Clear existing data before seeding"
            echo "  --images     Include product image seeding"
            echo "  --orders     Include sample orders generation"
            echo "  --all        Clear all data and seed everything"
            echo "  --help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Seed basic data only"
            echo "  $0 --clear            # Clear and seed basic data"
            echo "  $0 --images           # Seed with product images"
            echo "  $0 --all              # Complete reseed with everything"
            exit 0
            ;;
    esac
done

# Step 1: Clear data if requested
if [ "$CLEAR_ALL" = true ]; then
    echo ""
    echo "🗑️  Clearing existing data..."
    echo "--------------------------"
    
    run_seeder "seed_users.php" "Users" "--clear"
    run_seeder "seed_products.php" "Products" "--clear"
    
    if [ $? -ne 0 ]; then
        echo "❌ Data clearing failed"
        exit 1
    fi
    
    echo "✅ All data cleared successfully"
fi

# Step 2: Seed users
echo ""
echo "👥 Seeding Users..."
echo "-----------------"
run_seeder "seed_users.php" "Users"

if [ $? -ne 0 ]; then
    echo "❌ User seeding failed"
    exit 1
fi

# Step 3: Seed products
echo ""
echo "📦 Seeding Products..."
echo "-------------------"
run_seeder "seed_products.php" "Products"

if [ $? -ne 0 ]; then
    echo "❌ Product seeding failed"
    exit 1
fi

# Step 4: Seed product images if requested
if [ "$WITH_IMAGES" = true ]; then
    echo ""
    echo "🖼️  Seeding Product Images..."
    echo "-------------------------"
    run_seeder "seed_product_images.php" "Product Images"
    
    if [ $? -ne 0 ]; then
        echo "❌ Product image seeding failed"
        exit 1
    fi
fi

# Step 5: Generate sample orders if requested
if [ "$WITH_ORDERS" = true ]; then
    echo ""
    echo "📋 Generating Sample Orders..."
    echo "---------------------------"
    run_seeder "seed_users.php" "Sample Orders" "--orders"
    
    if [ $? -ne 0 ]; then
        echo "❌ Sample orders generation failed"
        exit 1
    fi
fi

# Final summary
echo ""
echo "🎉 Database Seeding Complete!"
echo "============================"
echo ""
echo "📊 Summary:"
echo "   ✅ Users seeded successfully"
echo "   ✅ Products seeded successfully"

if [ "$WITH_IMAGES" = true ]; then
    echo "   ✅ Product images seeded successfully"
fi

if [ "$WITH_ORDERS" = true ]; then
    echo "   ✅ Sample orders generated successfully"
fi

echo ""
echo "📁 Data locations:"
echo "   🗄️  Database: ecommerce_db"
echo "   🖼️  Images: $(pwd)/public/images/products/"
echo "   🌐 Web access: http://localhost:8000/images/products/"
echo ""
echo "📝 Next steps:"
echo "   1. Start your backend server: php -S localhost:8000"
echo "   2. Start your frontend development server"
echo "   3. Check the admin panel for new data"
echo "   4. Browse the products catalog"
echo ""

# Show database statistics
echo "📈 Database Statistics:"
echo "----------------------"

if command -v mysql &> /dev/null; then
    # Try to get database stats if mysql command is available
    echo "   Users: $(mysql -u root -e "SELECT COUNT(*) FROM ecommerce_db.users WHERE role = 'user';" 2>/dev/null | tail -1 2>/dev/null || echo "N/A")"
    echo "   Products: $(mysql -u root -e "SELECT COUNT(*) FROM ecommerce_db.products;" 2>/dev/null | tail -1 2>/dev/null || echo "N/A")"
    echo "   Categories: $(mysql -u root -e "SELECT COUNT(*) FROM ecommerce_db.categories;" 2>/dev/null | tail -1 2>/dev/null || echo "N/A")"
else
    echo "   (Install mysql client to see statistics)"
fi

echo ""
echo "🔐 Default Admin Login:"
echo "   Email: admin@example.com"
echo "   Password: password"
echo ""
echo "✨ Happy coding!"
