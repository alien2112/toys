# AMANLOVE - Toy Store 🎮❤️

React + TypeScript implementation of the Figma design for an Arabic toy store e-commerce website.

## Features

- ✨ Exact replica of Figma design
- 🌐 Full RTL (Right-to-Left) layout for Arabic content
- 🎨 Yellow banner with integrated search and cart
- 🎠 Hero carousel with colorful product showcase
- 📦 Category grid with 9 product categories
- 🎁 Feature cards highlighting store benefits
- 💬 WhatsApp floating button for customer support
- 📱 Responsive design for all devices

## Design Elements

### Header
- AMANLOVE logo with animated heart
- Navigation menu: من نحن؟ | اتصل بنا | السلة | جميع الألعاب

### Yellow Banner
- Search bar with category dropdown
- Shopping cart with item count and total
- "تسوق حسب الأقسام" text

### Hero Carousel
- Multi-colored diagonal sections (Yellow, Red, Blue, Peach, Pink)
- Product showcase with floating hearts
- Navigation arrows
- WhatsApp support button

### Categories (9 buttons)
- ألعاب أولاد
- ألعاب مائية
- العاب بنات
- العاب بيبي
- بالونات هيليوم
- تعليمي
- دراجات وسيارات
- سوبر كار
- مسابقات / تحديات

### Features
- 🚚 خدمة التوصيل (Delivery Service)
- ⭐ جودة عالية (High Quality)
- 💳 طرق دفع آمنة (Secure Payment)
- 🎁 تغليف هدايا (Gift Wrapping)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Design Source

This implementation is based on the Figma design:
- File ID: 0m4kIZFH8AvYtiwpIpsdTv
- Node ID: 2-775
- Design: 1440px width light theme

## Technologies

- React 18
- TypeScript 5
- Vite 5
- CSS3 with Flexbox/Grid
- Google Fonts (Cairo for Arabic, Inter for English/Numbers)

## Components Structure

```
src/
├── components/
│   ├── Header.tsx          # Top navigation with logo
│   ├── Header.css
│   ├── Masthead.tsx        # Banner, hero, categories, features
│   ├── Masthead.css
│   ├── ProductSection.tsx  # Product grid (below fold)
│   └── ProductSection.css
├── App.tsx
├── App.css
└── main.tsx
```

## Customization

### Adding Real Product Images
Replace the placeholder images in `Masthead.tsx`:
```typescript
<img src="/your-image.png" alt="Product" className="product-image" />
```

### Updating Colors
Main colors used:
- Yellow: `#FFD700` to `#FFC700`
- Red: `#DC143C` to `#B22222`
- Blue: `#87CEEB` to `#4FC3F7`
- Peach: `#FFDAB9` to `#FFB6A3`
- Pink: `#FFB6C1` to `#FFC0CB`

### WhatsApp Integration
Update the WhatsApp button in `Masthead.tsx` to link to your number:
```typescript
<a href="https://wa.me/YOUR_NUMBER" className="whatsapp-float">
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a design implementation based on Figma specifications.
