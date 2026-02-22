# Image Integration Guide

## Required Images for Hero Carousel

To complete the design, you'll need to add three product images to the hero carousel.

### Image Specifications

**Format**: PNG with transparent background (recommended)
**Size**: 400-600px width/height
**Quality**: High resolution for retina displays
**Background**: Transparent or white

### Products Needed

1. **Tricycle/Kids Bike** (Yellow section)
   - File: `public/tricycle.png`
   - Style: Modern kids tricycle
   - Color: Preferably neutral or matching yellow theme

2. **Baby Walker/High Chair** (Blue section)
   - File: `public/baby-chair.png`
   - Style: Modern baby walker or feeding chair
   - Color: White/neutral with colorful accents

3. **Baby Changing Table** (Pink section)
   - File: `public/baby-table.png`
   - Style: Pink/white baby changing station
   - Color: Pink or white to match section

### How to Add Images

#### Option 1: Using Public Folder
1. Place images in `public/` folder
2. Update `src/components/Masthead.tsx`:

```typescript
<div className="product-item yellow-bg">
  <img src="/tricycle.png" alt="Tricycle" className="product-image" />
</div>

<div className="product-item blue-bg">
  <img src="/baby-chair.png" alt="Baby Chair" className="product-image" />
</div>

<div className="product-item pink-bg">
  <img src="/baby-table.png" alt="Baby Table" className="product-image" />
</div>
```

#### Option 2: Using Assets Folder
1. Create `src/assets/` folder
2. Place images there
3. Import in component:

```typescript
import tricycleImg from '../assets/tricycle.png'
import babyChairImg from '../assets/baby-chair.png'
import babyTableImg from '../assets/baby-table.png'

// Then use in JSX:
<img src={tricycleImg} alt="Tricycle" className="product-image" />
```

#### Option 3: Using External URLs
```typescript
<img 
  src="https://your-cdn.com/images/tricycle.png" 
  alt="Tricycle" 
  className="product-image" 
/>
```

### Image Optimization Tips

1. **Compress images** before adding:
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Target: < 200KB per image

2. **Use WebP format** for better compression:
   ```html
   <picture>
     <source srcset="/tricycle.webp" type="image/webp">
     <img src="/tricycle.png" alt="Tricycle" className="product-image" />
   </picture>
   ```

3. **Add loading attribute**:
   ```typescript
   <img 
     src="/tricycle.png" 
     alt="Tricycle" 
     className="product-image"
     loading="lazy"
   />
   ```

4. **Responsive images**:
   ```typescript
   <img 
     src="/tricycle.png"
     srcSet="/tricycle-small.png 400w, /tricycle-large.png 800w"
     sizes="(max-width: 768px) 400px, 800px"
     alt="Tricycle" 
     className="product-image"
   />
   ```

### Where to Find Images

**Free Stock Photos**:
- Unsplash (unsplash.com)
- Pexels (pexels.com)
- Pixabay (pixabay.com)

**Product Images**:
- Manufacturer websites
- E-commerce platforms (with permission)
- Custom photography

**AI Generated**:
- DALL-E
- Midjourney
- Stable Diffusion

### Current Placeholder

The design currently uses placeholder text. The CSS is already configured to:
- Center images in their sections
- Scale images to fit (max 80% of container)
- Add drop shadow for depth
- Maintain aspect ratio

### Testing Images

After adding images, verify:
1. ✅ Images load correctly
2. ✅ Images are centered in colored sections
3. ✅ Images don't overflow containers
4. ✅ Images look good on mobile
5. ✅ Images have appropriate alt text
6. ✅ File sizes are optimized

### Example Implementation

```typescript
// src/components/Masthead.tsx

const Masthead: React.FC = () => {
  return (
    <>
      {/* ... other sections ... */}
      
      <section className="hero-carousel">
        <div className="carousel-container">
          <div className="carousel-slide">
            <div className="product-showcase">
              
              {/* Yellow Section - Tricycle */}
              <div className="product-item yellow-bg">
                <img 
                  src="/images/tricycle.png" 
                  alt="دراجة أطفال ثلاثية العجلات" 
                  className="product-image"
                  loading="eager"
                />
              </div>
              
              {/* Red Divider */}
              <div className="product-item red-bg"></div>
              
              {/* Blue Section - Baby Chair */}
              <div className="product-item blue-bg">
                <img 
                  src="/images/baby-chair.png" 
                  alt="كرسي طعام للأطفال" 
                  className="product-image"
                  loading="eager"
                />
              </div>
              
              {/* Peach Divider */}
              <div className="product-item peach-bg"></div>
              
              {/* Pink Section - Baby Table */}
              <div className="product-item pink-bg">
                <img 
                  src="/images/baby-table.png" 
                  alt="طاولة تغيير الأطفال" 
                  className="product-image"
                  loading="eager"
                />
              </div>
              
            </div>
          </div>
        </div>
      </section>
      
      {/* ... other sections ... */}
    </>
  )
}
```

### Troubleshooting

**Images not showing?**
- Check file path is correct
- Verify image files exist in public folder
- Check browser console for 404 errors
- Clear browser cache

**Images too large/small?**
- Adjust in CSS: `.product-image { max-width: 70%; }`
- Or use specific dimensions: `width: 400px;`

**Images look pixelated?**
- Use higher resolution source images
- Ensure images are at least 2x display size for retina

**Images load slowly?**
- Compress images more
- Use WebP format
- Implement lazy loading
- Consider CDN for hosting
