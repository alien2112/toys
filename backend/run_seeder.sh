#!/bin/bash

echo "🚀 Starting Product Image Seeding..."
echo "=================================="

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed or not in PATH"
    exit 1
fi

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ curl is not installed or not in PATH"
    exit 1
fi

# Change to backend directory
cd "$(dirname "$0")"

# Run the seeder
php seed_product_images.php

echo ""
echo "✅ Seeding completed!"
echo ""
echo "📁 Images saved to: $(pwd)/public/images/products/"
echo "🌐 Web accessible at: http://localhost:8000/images/products/"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure your backend server is running"
echo "   2. Check the frontend to see the new images"
echo "   3. Verify the database has been updated"
