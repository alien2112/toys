#!/bin/bash

# Create blog placeholder images
echo "Creating blog placeholder images..."

BLOG_DIR="/home/alien/Desktop/TOYS/public/blogs"

# Create simple SVG placeholder images for blogs
BLOG_IMAGES=(
    "blog-tech-trends.jpg"
    "blog-ai-future.jpg"
    "blog-web-development.jpg"
    "blog-mobile-apps.jpg"
    "blog-cybersecurity.jpg"
    "blog-cloud-computing.jpg"
    "blog-data-science.jpg"
    "blog-startup-guide.jpg"
    "blog-digital-marketing.jpg"
    "blog-ecommerce-tips.jpg"
    "blog-product-design.jpg"
    "blog-user-experience.jpg"
)

for image in "${BLOG_IMAGES[@]}"; do
    # Create a simple gradient SVG for each blog image
    cat > "$BLOG_DIR/${image%.jpg}.svg" << EOF
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#grad)" />
  <text x="400" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    Blog Image
  </text>
  <text x="400" y="230" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.8">
    ${image%.jpg}
  </text>
</svg>
EOF
    
    echo "✓ Created $BLOG_DIR/${image%.jpg}.svg"
done

echo "Blog placeholder images created successfully!"
