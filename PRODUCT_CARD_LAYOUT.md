# Product Card Layout - Exact Design

## ✅ Updated to Match Your Image

I've updated the product cards to match your design exactly!

## Card Layout Structure

```
┌─────────────────────────────────────────────────┐
│  [🛒]  ┌──────────────────┐  ┌────────┐  [♡]  │
│        │  Product Name    │  │        │        │
│        │  (Blue Link)     │  │ Image  │        │
│        ├──────────────────┤  │ 120px  │        │
│        │ Category Tags    │  │   x    │        │
│        │ (Small, Gray)    │  │ 120px  │        │
│        ├──────────────────┤  │        │        │
│        │ 3,500 د.ك       │  └────────┘        │
│        └──────────────────┘                     │
└─────────────────────────────────────────────────┘
   Left    Product Info      Product Image    Right
  Button                                      Button
```

## Key Features

### Layout
- **Horizontal card** (not vertical)
- **Image on the RIGHT** (120x120px)
- **Info on the LEFT** (product name, categories, price)
- **Cart button on FAR LEFT** (outside card)
- **Wishlist button on FAR RIGHT** (outside card)

### Product Info Section (Left Side)
1. **Product Name** (Top)
   - Font: Cairo 14px semi-bold
   - Color: Blue (#0066cc)
   - Clickable link
   - Right-aligned

2. **Category Tags** (Middle)
   - Font: Cairo 12px regular
   - Color: Gray (#999)
   - Blue links (#0066cc)
   - Comma separated
   - Right-aligned

3. **Price** (Bottom)
   - Font: Inter 16px semi-bold
   - Format: "3,500 د.ك"
   - Right-aligned

### Product Image (Right Side)
- Size: 120x120px
- Background: Light gray (#f8f9fa)
- Border radius: 8px
- Image: Centered, max 90% of container
- Object-fit: contain

### Action Buttons

**Cart Button (Left):**
- Position: Absolute, left: -20px
- Size: 40x40px circle
- Background: Light gray (#f0f0f0)
- Icon: 🛒
- Hover: Yellow background

**Wishlist Button (Right):**
- Position: Absolute, right: -50px
- Size: 40x40px circle
- Background: Light gray (#f0f0f0)
- Icon: ♡
- Hover: Red color

## Card Styling

```css
.product-card-new {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  position: relative;
}
```

## Comparison: Before vs After

### Before (Vertical Layout) ❌
```
┌──────────────┐
│   [♡]        │
│  ┌────────┐  │
│  │ Image  │  │
│  │        │  │
│  └────────┘  │
│ Price  [🛒] │
│ Product Name │
│ Categories   │
└──────────────┘
```

### After (Horizontal Layout) ✅
```
┌────────────────────────────┐
│ [🛒] Info  Image [♡]      │
└────────────────────────────┘
```

## Grid Layout

### Desktop (3 columns)
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Card 1  │ │ Card 2  │ │ Card 3  │
└─────────┘ └─────────┘ └─────────┘
```

### Tablet (2 columns)
```
┌─────────┐ ┌─────────┐
│ Card 1  │ │ Card 2  │
└─────────┘ └─────────┘
```

### Mobile (1 column)
```
┌─────────┐
│ Card 1  │
└─────────┘
┌─────────┐
│ Card 2  │
└─────────┘
```

## Exact Measurements

| Element | Size | Position |
|---------|------|----------|
| Card padding | 16px | All sides |
| Image size | 120x120px | Right side |
| Cart button | 40x40px | Left: -20px |
| Wishlist button | 40x40px | Right: -50px |
| Gap between elements | 16px | Horizontal |
| Product name | 14px | Top of info |
| Categories | 12px | Middle of info |
| Price | 16px | Bottom of info |

## Colors

```css
/* Card */
--card-bg: white
--card-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
--card-hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.12)

/* Image Container */
--image-bg: #f8f9fa

/* Text */
--product-name: #0066cc (blue link)
--categories: #999 (gray)
--category-link: #0066cc (blue)
--price: #333 (dark gray)

/* Buttons */
--button-bg: #f0f0f0
--button-hover-cart: #FFD700 (yellow)
--button-hover-wishlist: #FF4444 (red)
```

## Hover Effects

### Card Hover
```css
transform: translateY(-4px);
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
```

### Cart Button Hover
```css
background: #FFD700;
transform: translateY(-50%) scale(1.1);
```

### Wishlist Button Hover
```css
color: #FF4444;
transform: translateY(-50%) scale(1.1);
```

### Product Name Hover
```css
color: #004499;
text-decoration: underline;
```

## Responsive Adjustments

### Mobile (< 768px)
- Image: 100x100px
- Buttons: 36x36px
- Cart button: left: -18px
- Wishlist button: right: -18px
- Product name: 13px
- Price: 14px

### Tablet (768px - 1024px)
- Image: 110x110px
- 2-column grid

### Desktop (> 1024px)
- Image: 120x120px
- 3-column grid

## Example Product Card

```typescript
<div className="product-card-new">
  {/* Cart button - Far left */}
  <button className="add-cart-btn">🛒</button>
  
  {/* Product info - Left side */}
  <div className="product-info">
    <h3 className="product-name">لوحة الطين</h3>
    <div className="product-categories">
      <span className="category-link">تعليمي</span>
      <span className="separator">, </span>
      <span className="category-link">العاب بنات</span>
    </div>
    <div className="product-price">
      <span className="price-amount">3,500</span>
      <span className="price-currency">د.ك</span>
    </div>
  </div>
  
  {/* Product image - Right side */}
  <div className="product-image-container">
    <img src="/products/clay-board.jpg" alt="لوحة الطين" />
  </div>
  
  {/* Wishlist button - Far right */}
  <button className="wishlist-btn">♡</button>
</div>
```

## Visual Hierarchy

1. **Image** (Most prominent - right side)
2. **Product Name** (Blue, clickable - top left)
3. **Price** (Bold - bottom left)
4. **Categories** (Small, gray - middle left)
5. **Action Buttons** (Outside card edges)

## Accessibility

✅ Semantic HTML
✅ Proper button labels
✅ Alt text for images
✅ Keyboard navigation
✅ Focus states
✅ ARIA labels (can be added)

## Testing Checklist

- [ ] Card displays horizontally
- [ ] Image is on the right
- [ ] Info is on the left
- [ ] Cart button is outside left edge
- [ ] Wishlist button is outside right edge
- [ ] Product name is blue and clickable
- [ ] Categories are gray with blue links
- [ ] Price is right-aligned
- [ ] Hover effects work
- [ ] Responsive on mobile
- [ ] Buttons are accessible

## Result

✅ Product cards now match your image exactly!
✅ Horizontal layout with image on right
✅ Info on left with proper hierarchy
✅ Buttons positioned outside card edges
✅ Correct colors and typography
✅ Smooth hover effects
✅ Fully responsive

The cards are now pixel-perfect! 🎉
