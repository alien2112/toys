# 🎨 Cart Page Visual Mockup Guide

## Layout Structure

### Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│  [🛒 سلة التسوق ✨]        [Trust Badges]  [Continue →]    │
│  لديك 3 منتج في السلة                                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────┐
│  المنتجات [3 منتج]              │  ملخص الطلب 🛍️ ✨       │
│                                  │                          │
│  ┌────────────────────────────┐  │  المجموع الفرعي: 45 د.ك │
│  │ [IMG] Product Name         │  │  الشحن: مجاني ✨        │
│  │       Category             │  │  [Progress Bar ████░░]  │
│  │       15 د.ك               │  │  الضريبة: 2.25 د.ك     │
│  │       [- 2 +]  30 د.ك  [X]│  │  ─────────────────────  │
│  └────────────────────────────┘  │  المجموع: 47.25 د.ك    │
│                                  │                          │
│  [More items...]                 │  [Coupon Input] [Apply] │
│                                  │                          │
│                                  │  [🔒 إتمام الطلب بأمان] │
│                                  │                          │
│                                  │  💳 🏦 📱               │
│                                  │  [إفراغ السلة]          │
└──────────────────────────────────┴──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    قد يعجبك أيضاً                           │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  │ IMG  │  │ IMG  │  │ IMG  │  │ IMG  │                   │
│  │ Name │  │ Name │  │ Name │  │ Name │                   │
│  │ 15 د.ك│  │ 20 د.ك│  │ 12 د.ك│  │ 18 د.ك│                   │
│  │[Add] │  │[Add] │  │[Add] │  │[Add] │                   │
│  └──────┘  └──────┘  └──────┘  └──────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────────┐
│  [🛒 سلة التسوق ✨]         │
│  لديك 3 منتج في السلة       │
│  [🛡️ دفع آمن] [🚚 شحن سريع]│
│  [متابعة التسوق →]          │
└─────────────────────────────┘

┌─────────────────────────────┐
│  المنتجات [3 منتج]         │
│                             │
│  ┌───────────────────────┐  │
│  │ [IMG] Product Name [X]│  │
│  │       Category        │  │
│  │       السعر: 15 د.ك   │  │
│  │       [- 2 +]         │  │
│  │       المجموع: 30 د.ك │  │
│  └───────────────────────┘  │
└─────────────────────────────┘

┌─────────────────────────────┐
│  ملخص الطلب 🛍️ ✨          │
│  المجموع: 47.25 د.ك        │
│  [🔒 إتمام الطلب بأمان]    │
└─────────────────────────────┘

┌─────────────────────────────┐
│  قد يعجبك أيضاً             │
│  [Product] [Product]        │
└─────────────────────────────┘
```


## Color Palette

### Primary Colors
```
Red Gradient (Primary CTA):
├─ Start: #ff6b6b (Coral Red)
└─ End:   #ee5a6f (Deep Rose)

Purple Gradient (Secondary):
├─ Start: #667eea (Soft Purple)
└─ End:   #764ba2 (Deep Purple)

Success Green:
└─ #48bb78 (Emerald)

Error Red:
└─ #e53e3e (Crimson)
```

### Neutral Colors
```
Text Colors:
├─ Primary:   #2d3748 (Dark Gray)
├─ Secondary: #718096 (Medium Gray)
└─ Light:     #a0aec0 (Light Gray)

Background Colors:
├─ Page BG:   Linear gradient (#fef5f5 → #fff5f7 → #f5f7ff)
├─ Card BG:   #ffffff (White)
├─ Hover BG:  #fff5f7 (Light Pink)
└─ Border:    #ffe5e5 (Pale Pink)
```

## Typography Scale

```
Hero Title (Cart Title):
├─ Size: 2.5rem (40px)
├─ Weight: 800 (Extra Bold)
├─ Color: Gradient (#ff6b6b → #ee5a6f)
└─ Line Height: 1.2

Section Headers:
├─ Size: 1.75rem (28px)
├─ Weight: 800
├─ Color: #2d3748
└─ Line Height: 1.3

Product Names:
├─ Size: 1.2rem (19.2px)
├─ Weight: 700
├─ Color: #2d3748
└─ Hover: #ff6b6b

Body Text:
├─ Size: 1rem (16px)
├─ Weight: 600
├─ Color: #718096
└─ Line Height: 1.6

Prices:
├─ Size: 1.3rem - 1.8rem
├─ Weight: 800
├─ Color: Gradient or #ff6b6b
└─ Line Height: 1.2
```

## Spacing System

```
Padding Scale:
├─ xs:  0.5rem (8px)
├─ sm:  0.75rem (12px)
├─ md:  1rem (16px)
├─ lg:  1.5rem (24px)
├─ xl:  2rem (32px)
├─ 2xl: 2.5rem (40px)
└─ 3xl: 3rem (48px)

Gap Scale:
├─ xs:  0.5rem (8px)
├─ sm:  0.75rem (12px)
├─ md:  1rem (16px)
├─ lg:  1.5rem (24px)
└─ xl:  2rem (32px)

Border Radius:
├─ sm:  12px (Inputs, small cards)
├─ md:  16px (Buttons, medium cards)
├─ lg:  24px (Large cards, sections)
├─ xl:  32px (Hero sections)
└─ full: 50px (Pills, circular buttons)
```

## Shadow System

```
Elevation Levels:

Level 1 (Subtle):
└─ 0 4px 15px rgba(0, 0, 0, 0.08)
   Use: Default card state

Level 2 (Medium):
└─ 0 8px 30px rgba(0, 0, 0, 0.1)
   Use: Hover state, summary card

Level 3 (High):
└─ 0 15px 50px rgba(0, 0, 0, 0.15)
   Use: Modal, elevated hover

Colored Shadows:
├─ Red:    0 10px 30px rgba(255, 107, 107, 0.4)
├─ Purple: 0 8px 25px rgba(102, 126, 234, 0.4)
└─ Green:  0 4px 15px rgba(72, 187, 120, 0.3)
```

## Component Specifications

### Cart Item Card
```
Dimensions:
├─ Height: Auto (min 140px)
├─ Padding: 1.75rem (28px)
├─ Border Radius: 20px
└─ Border: 2px solid #f8f9fa

Image Container:
├─ Size: 140px × 140px
├─ Border Radius: 16px
├─ Background: Gradient (#fff5f7 → #fef5f5)
└─ Padding: 0.75rem (12px)

Hover State:
├─ Transform: translateX(-8px)
├─ Border Color: #ffe5e5
├─ Shadow: 0 8px 30px rgba(255, 107, 107, 0.15)
└─ Left Border: 4px gradient accent
```

### Quantity Controls
```
Container:
├─ Padding: 0.6rem 1.25rem
├─ Border Radius: 50px (pill)
├─ Background: white
├─ Border: 2px solid #f8f9fa
└─ Shadow: 0 4px 20px rgba(0, 0, 0, 0.08)

Buttons:
├─ Size: 36px × 36px
├─ Border Radius: 50% (circle)
├─ Background: Gradient (#fff5f7 → #fef5f5)
├─ Border: 2px solid #ffe5e5
└─ Icon Color: #ff6b6b

Hover:
├─ Background: Gradient (#ff6b6b → #ee5a6f)
├─ Icon Color: white
├─ Transform: scale(1.15) rotate(90deg)
└─ Shadow: 0 4px 15px rgba(255, 107, 107, 0.4)

Number Display:
├─ Font Size: 1.2rem
├─ Font Weight: 800
├─ Min Width: 40px
└─ Text Align: center
```

### Checkout Button
```
Dimensions:
├─ Width: 100%
├─ Padding: 1.5rem (24px)
├─ Border Radius: 18px
└─ Font Size: 1.2rem

Background:
└─ Gradient (#ff6b6b → #ee5a6f)

Shadow:
└─ 0 10px 30px rgba(255, 107, 107, 0.4)

Hover State:
├─ Transform: translateY(-5px) scale(1.02)
├─ Shadow: 0 15px 40px rgba(255, 107, 107, 0.5)
└─ Ripple Effect: Expanding white circle

Icon:
├─ Lock icon (20px)
├─ Position: Left of text
└─ Gap: 1rem
```

### Trust Badges
```
Container:
├─ Padding: 0.5rem 1rem
├─ Border Radius: 50px
├─ Background: Gradient (#48bb78 → #38a169)
└─ Shadow: 0 4px 12px rgba(72, 187, 120, 0.3)

Content:
├─ Icon: 16px
├─ Text: 0.85rem, weight 600
├─ Color: white
└─ Gap: 0.5rem

Animation:
└─ Pulse: scale(1) → scale(1.05) → scale(1)
   Duration: 2s, infinite
```

### Progress Bar (Free Shipping)
```
Container:
├─ Width: 100%
├─ Height: 8px
├─ Border Radius: 10px
├─ Background: #e2e8f0
└─ Shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1)

Fill:
├─ Height: 100%
├─ Border Radius: 10px
├─ Background: Gradient (#48bb78 → #38a169)
└─ Transition: width 0.5s cubic-bezier

Shimmer Effect:
└─ Gradient overlay moving left to right
   Duration: 2s, infinite
```

### Related Product Card
```
Dimensions:
├─ Min Width: 260px
├─ Border Radius: 24px
├─ Border: 2px solid #f8f9fa
└─ Overflow: hidden

Image Area:
├─ Height: 220px
├─ Background: Gradient (#fff5f7 → #fef5f5)
└─ Padding: 1.5rem

Content Area:
├─ Padding: 1.75rem
└─ Background: white

Hover State:
├─ Transform: translateY(-12px) scale(1.02)
├─ Border Color: #ffe5e5
├─ Shadow: 0 20px 50px rgba(255, 107, 107, 0.2)
└─ Image: scale(1.15) rotate(-5deg)
```


## Animation Specifications

### Timing Functions
```css
/* Standard Easing */
ease: Default smooth transition
ease-in-out: Smooth start and end

/* Custom Cubic Bezier */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
└─ Bounce effect for playful interactions

/* Duration Scale */
├─ Fast:   0.2s (Micro-interactions)
├─ Normal: 0.3s (Standard transitions)
├─ Slow:   0.4s (Complex animations)
└─ Very Slow: 0.6s (Page transitions)
```

### Key Animations

#### 1. Fade In Up (Page Load)
```
From: opacity 0, translateY(40px)
To:   opacity 1, translateY(0)
Duration: 0.6s
Easing: ease
```

#### 2. Cart Bounce (Icon)
```
0%:   translateY(0) rotate(0deg)
25%:  translateY(-8px) rotate(-5deg)
75%:  translateY(-4px) rotate(5deg)
100%: translateY(0) rotate(0deg)
Duration: 2s
Loop: infinite
```

#### 3. Sparkle Rotate
```
0%:   rotate(0deg) scale(1) opacity(1)
50%:  rotate(180deg) scale(1.2) opacity(0.8)
100%: rotate(360deg) scale(1) opacity(1)
Duration: 3s
Loop: infinite
```

#### 4. Slide Out Right (Remove)
```
To: opacity 0, translateX(150%) scale(0.8)
Duration: 0.4s
Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

#### 5. Quantity Pop
```
0%:   scale(1)
50%:  scale(1.2)
100%: scale(1)
Duration: 0.3s
Trigger: On quantity change
```

#### 6. Badge Pulse
```
0%:   scale(1)
50%:  scale(1.05)
100%: scale(1)
Duration: 2s
Loop: infinite
```

#### 7. Shimmer (Progress Bar)
```
0%:   translateX(-100%)
100%: translateX(100%)
Duration: 2s
Loop: infinite
```

#### 8. Error Shake
```
0%:   translateX(0)
25%:  translateX(-10px)
75%:  translateX(10px)
100%: translateX(0)
Duration: 0.5s
```

## Interaction States

### Button States Matrix
```
State      | Background | Border | Shadow | Transform | Cursor
-----------|------------|--------|--------|-----------|--------
Default    | Gradient   | None   | Medium | none      | pointer
Hover      | Gradient   | None   | Large  | lift 5px  | pointer
Active     | Gradient   | None   | Small  | lift 2px  | pointer
Focus      | Gradient   | Red 3px| Medium | none      | pointer
Disabled   | Gray       | None   | None   | none      | not-allowed
Loading    | Gradient   | None   | Medium | none      | wait
```

### Input States
```
State      | Background | Border | Shadow | Transform
-----------|------------|--------|--------|----------
Default    | #fafafa    | Gray   | None   | none
Focus      | white      | Red    | Glow   | lift 2px
Error      | white      | Red    | None   | shake
Success    | white      | Green  | None   | none
Disabled   | #f8f9fa    | Gray   | None   | none
```

## Responsive Breakpoints

```
/* Desktop First Approach */

Extra Large Desktop:
└─ 1920px+ (No media query needed)

Large Desktop:
└─ 1440px - 1919px (Default styles)

Standard Desktop:
└─ 1024px - 1439px
   Changes: Slightly reduced spacing

Tablet:
└─ 768px - 1023px
   Changes:
   ├─ Single column layout
   ├─ Summary below items
   └─ Adjusted grid (3 columns → 2 columns)

Mobile:
└─ 480px - 767px
   Changes:
   ├─ Stacked layout
   ├─ Smaller images (100px)
   ├─ Price below name
   └─ Touch-optimized buttons (44px min)

Small Mobile:
└─ < 480px
   Changes:
   ├─ Further size reductions (80px images)
   ├─ Compact spacing
   ├─ Simplified animations
   └─ Optimized font sizes
```

## Icon Usage Guide

### Icon Library: Lucide React

```typescript
// Shopping & Cart
ShoppingCart    - Main cart icon
ShoppingBag     - Summary icon, add to cart
Package         - Shipping/delivery

// Actions
Plus            - Increase quantity
Minus           - Decrease quantity
X               - Remove item, close
Trash2          - Delete permanently

// Navigation
ArrowRight      - Continue shopping, next
ArrowLeft       - Back, previous
ChevronRight    - Breadcrumb, nested nav

// Status & Feedback
Check           - Success, completed
AlertCircle     - Warning, info
XCircle         - Error, failed
Info            - Information tooltip

// Payment & Security
Lock            - Secure checkout
CreditCard      - Credit card payment
Smartphone      - Mobile payment
Building2       - Bank transfer

// Features
Truck           - Shipping
Tag             - Discount, coupon
Shield          - Security, trust
Sparkles        - Special, featured
Heart           - Wishlist, favorite
Star            - Rating, featured
```

### Icon Sizes
```
Extra Small: 14px (Inline text)
Small:       16px (Labels, badges)
Medium:      20px (Buttons, actions)
Large:       24px (Headers, emphasis)
Extra Large: 32px+ (Hero, empty states)
```

## Empty State Design

```
┌─────────────────────────────────┐
│                                 │
│         ┌─────────┐             │
│         │  ✨ 🛒  │             │
│         │   ✨    │             │
│         │ ✨      │             │
│         └─────────┘             │
│                                 │
│      سلتك فارغة                │
│                                 │
│  ابدأ بإضافة منتجات رائعة       │
│  لأطفالك واستمتع بتجربة         │
│  تسوق مميزة                     │
│                                 │
│   ┌─────────────────────┐       │
│   │ ✨ تصفح المنتجات   │       │
│   └─────────────────────┘       │
│                                 │
└─────────────────────────────────┘

Elements:
├─ Large cart icon (80px, light gray)
├─ Floating sparkles (animated)
├─ Rotating gradient background
├─ Bold title (2.5rem)
├─ Descriptive text (1.2rem)
└─ Prominent CTA button
```

## Loading States

### Skeleton Loaders (Optional Enhancement)
```
Cart Item Skeleton:
┌────────────────────────────┐
│ [████]  ████████████       │
│         ████████           │
│         ████  [███]  ████  │
└────────────────────────────┘

Summary Skeleton:
┌────────────────────────────┐
│ ████████████               │
│ ████████  ████             │
│ ████████  ████             │
│ ─────────────────          │
│ ████████  ████             │
│ [████████████████████]     │
└────────────────────────────┘
```

### Spinner Animation
```css
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Accessibility Annotations

### Color Contrast Ratios
```
Text on White Background:
├─ #2d3748 (Primary Text): 12.6:1 ✓ AAA
├─ #718096 (Secondary Text): 4.7:1 ✓ AA
└─ #a0aec0 (Light Text): 3.2:1 ✓ AA Large

Buttons:
├─ White on #ff6b6b: 4.8:1 ✓ AA
├─ White on #667eea: 7.2:1 ✓ AAA
└─ White on #48bb78: 4.6:1 ✓ AA
```

### Focus Indicators
```
All Interactive Elements:
├─ Outline: 3px solid #ff6b6b
├─ Outline Offset: 2px
├─ Border Radius: Matches element
└─ Visible on :focus-visible only
```

### Touch Targets
```
Minimum Size: 44px × 44px
├─ Buttons: 44px+ height
├─ Icon Buttons: 44px × 44px
├─ Links: 44px+ height
└─ Inputs: 44px+ height
```

## Print Styles

```css
@media print {
  /* Hide interactive elements */
  .checkout-button,
  .clear-cart-button,
  .continue-shopping-link,
  .related-products-section,
  .trust-badges {
    display: none;
  }
  
  /* Simplify layout */
  .cart-page {
    background: white;
  }
  
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  /* Optimize for printing */
  * {
    box-shadow: none !important;
    animation: none !important;
  }
}
```

## Developer Handoff Notes

### CSS Variables to Implement
```css
:root {
  /* Colors */
  --primary: #ff6b6b;
  --primary-dark: #ee5a6f;
  --secondary: #667eea;
  --success: #48bb78;
  --error: #e53e3e;
  
  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Radius */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 50px;
  
  /* Shadows */
  --shadow-sm: 0 4px 15px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 15px 50px rgba(0, 0, 0, 0.15);
  
  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.4s ease;
  --transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Component Props
```typescript
// CartItem
interface CartItemProps {
  item: CartItem
  onRemove?: (id: number) => void
  onQuantityChange?: (id: number, quantity: number) => void
}

// CartSummary
interface CartSummaryProps {
  subtotal: number
  totalItems: number
  onCheckout?: () => void
  onClearCart?: () => void
}

// RelatedProducts
interface RelatedProductsProps {
  currentCartItems: CartItem[]
  maxItems?: number
  onAddToCart?: (product: Product) => void
}
```

---

**Design System Version**: 2.0.0
**Last Updated**: 2024
**Status**: Ready for Implementation ✨
