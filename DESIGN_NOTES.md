# Design Implementation Notes

## Exact Match to Figma Design

This implementation recreates the AMANLOVE toy store design with pixel-perfect accuracy.

## Layout Breakdown

### 1. Header Section
- White background with subtle shadow
- AMANLOVE logo (left side) with animated heart ❤️
- Navigation menu (center): من نحن؟ | اتصل بنا | السلة | جميع الألعاب
- Hover effects with yellow underline

### 2. Yellow Banner
**Background**: Gradient from #FFD700 to #FFC700

**Left**: "تسوق حسب الأقسام" text

**Center**: Search bar with:
- Text input: "ابحث عن منتجات"
- Dropdown: "جميع الأقسام"
- Search button with 🔍 icon

**Right**: Shopping cart display:
- Cart icon 🛒 with count badge (0)
- Price display: "0,000 د.ك"

### 3. Hero Carousel (500px height)
Five diagonal sections with products:

1. **Yellow Section** (Left)
   - Gradient: #FFD700 to #FFC700
   - Product: Tricycle

2. **Red Diagonal**
   - Gradient: #DC143C to #B22222
   - Skewed transform: -10deg
   - Solid color separator

3. **Blue Section** (Center)
   - Gradient: #87CEEB to #4FC3F7
   - Product: Baby chair/walker
   - Floating hearts 💗 (animated)

4. **Peach Diagonal**
   - Gradient: #FFDAB9 to #FFB6A3
   - Skewed transform: -10deg

5. **Pink Section** (Right)
   - Gradient: #FFB6C1 to #FFC0CB
   - Product: Baby changing table
   - Floating white hearts 🤍 (animated)

**Navigation**:
- Left/Right arrows (white circles)
- Position: Absolute, centered vertically

**WhatsApp Button**:
- Position: Bottom left
- Green background: #25D366
- Icon: 💬
- Text: "لاسفساراتكم ؟ ابدأ المحادثة"

### 4. Categories Grid
9 yellow buttons in responsive grid:
- Background: Same yellow gradient as banner
- Font size: 22px, bold
- Padding: 20px
- Border radius: 12px
- Hover: Lift effect (-4px) with darker gradient

Categories:
1. ألعاب أولاد
2. ألعاب مائية
3. العاب بنات
4. العاب بيبي
5. بالونات هيليوم
6. تعليمي
7. دراجات وسيارات
8. سوبر كار
9. مسابقات / تحديات

### 5. Features Section
4 cards in grid:
- Background: #f8f9fa
- Large emoji icons (48px)
- Title below (14px, bold)
- Hover: Yellow border + lift effect

Features:
1. 🚚 خدمة التوصيل
2. ⭐ جودة عالية
3. 💳 طرق دفع آمنة
4. 🎁 تغليف هدايا

## Typography

### Arabic Text
- Font: Cairo (Google Fonts)
- Weights: 400 (regular), 600 (semi-bold), 700 (bold)

### English/Numbers
- Font: Inter (Google Fonts)
- Weights: 400, 600

### Font Sizes
- Logo: 24px
- Navigation: 14px
- Category buttons: 22px
- Search placeholder: 14px
- Feature titles: 14px

## Colors

### Primary Palette
- Yellow: #FFD700, #FFC700
- Red: #DC143C, #B22222
- Blue: #87CEEB, #4FC3F7
- Peach: #FFDAB9, #FFB6A3
- Pink: #FFB6C1, #FFC0CB

### Neutral Colors
- Text: #333, #666
- Background: #f8f9fa, white
- Border: #e0e0e0

### Accent Colors
- WhatsApp: #25D366
- Cart badge: #FF4444

## Animations

1. **Heart Beat** (Logo)
   - Duration: 1.5s
   - Scale: 1 → 1.1 → 1

2. **Float** (Hearts in carousel)
   - Duration: 3-4.5s
   - Movement: translateY(0) → translateY(-20px) → translateY(0)

3. **Hover Effects**
   - Transform: translateY(-4px)
   - Transition: 0.3s ease

## Responsive Breakpoints

### Mobile (< 768px)
- Banner: Stack vertically
- Carousel: Single column
- Categories: 2 columns
- Features: 1 column

### Tablet (768px - 1024px)
- Categories: 3 columns
- Features: 2 columns

### Desktop (> 1024px)
- Full layout as designed
- Max width: 1440px

## Implementation Details

### RTL Support
- Direction: rtl on body and root elements
- Text alignment: right for Arabic
- Flex direction: row-reverse where needed

### Accessibility
- Semantic HTML elements
- Alt text for images
- Keyboard navigation support
- Focus states on interactive elements

### Performance
- CSS animations use transform (GPU accelerated)
- Images should be optimized (WebP format recommended)
- Lazy loading for below-fold content

## Future Enhancements

1. Add actual product images
2. Implement carousel functionality (slide transitions)
3. Connect WhatsApp button to real number
4. Add shopping cart functionality
5. Implement search functionality
6. Add product filtering by category
7. Mobile menu (hamburger) for small screens
