import React, { useState } from 'react'
import { Heart, ShoppingCart, ChevronRight, ChevronLeft, ArrowLeft, Star, Box, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import './ProductSections.css'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating?: number
  reviewsCount?: number
}

interface ProductSectionsProps {
  featuredProducts: Product[]
  topRatedProducts: Product[]
}

const StarRating: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  return (
    <div className="ps-stars" aria-label={`تقييم ${rating} من 5`}>
      {stars.map(s => (
        <svg
          key={s}
          className={`ps-star ${s <= Math.round(rating) ? 'ps-star--filled' : ''}`}
          width="13" height="13" viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {count && count > 0 && (
        <span className="ps-stars__count">({count})</span>
      )}
    </div>
  )
}

const ProductCard: React.FC<{ product: Product; onCart: (p: Product) => void }> = ({ product, onCart }) => {
  const [wished, setWished] = useState(false)

  return (
    <Link to={`/products/${product.id}`} className="ps-card-link">
      <article className="ps-card" aria-label={product.name}>
        {/* Badges */}
        {product.rating && product.rating >= 4.5 ? (
          <span className="ps-card__badge ps-card__badge--hot"><Star size={12} fill="currentColor" strokeWidth={0} /> الأعلى تقييماً</span>
        ) : null}

        {/* Wishlist */}
        <button
          className={`ps-card__wish ${wished ? 'ps-card__wish--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setWished(w => !w);
          }}
          aria-label={wished ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
        </button>

      {/* Image */}
        <div className="ps-card__img-wrap">
          {product.image
            ? <img src={product.image} alt={product.name} className="ps-card__img" loading="lazy" />
            : <div className="ps-card__img-placeholder"><Box size={32} /></div>
          }
          {/* Add to cart overlay */}
          <button
            className="ps-card__cart-overlay"
            onClick={(e) => {
              e.stopPropagation();
              onCart(product);
            }}
            aria-label={`إضافة ${product.name} إلى السلة`}
          >
            <ShoppingCart size={18} />
            <span>أضف للسلة</span>
          </button>
        </div>

        {/* Info */}
        <div className="ps-card__info">
          {product.category && (
            <span className="ps-card__cat">{product.category}</span>
          )}
          <h3 className="ps-card__name" title={product.name}>{product.name}</h3>

          {product.rating && product.rating > 0 ? (
            <StarRating rating={product.rating} count={product.reviewsCount} />
          ) : null}

          <div className="ps-card__footer">
            <div className="ps-card__price">
              <span className="ps-card__price-val">{product.price.toFixed(2)}</span>
              <span className="ps-card__price-cur">ر.س</span>
            </div>
            <button
              className="ps-card__cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCart(product);
              }}
              aria-label={`إضافة ${product.name} إلى السلة`}
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}

const TABS = ['منتجات متميزة', 'عروض', 'أحدث الألعاب']

const ProductSections: React.FC<ProductSectionsProps> = ({ featuredProducts, topRatedProducts }) => {
  const { addToCart } = useCart()
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState(0)

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
  }

  const showFeatured = featuredProducts.length > 0
  const showTopRated = topRatedProducts.length > 0
  const showEmpty = !showFeatured && !showTopRated

  return (
    <div className="ps-wrap" dir="rtl">

      {/* Empty state */}
      {showEmpty && (
        <div className="ps-empty">
          <span className="ps-empty__icon"><Box size={48} /></span>
          <h3>لا توجد منتجات حالياً</h3>
          <p>سيتم إضافة المنتجات قريباً. تفقد المتجر مرة أخرى!</p>
          <Link to="/products" className="ps-empty__link">تصفح جميع المنتجات</Link>
        </div>
      )}

      {/* ── Featured Section ── */}
      {showFeatured && (
        <section className="ps-section" aria-labelledby="featured-title">
          <div className="ps-section__head">
            <div className="ps-section__title-wrap">
              <h2 className="ps-section__title" id="featured-title">منتجات متميزة</h2>
              <div className="ps-section__title-bar" />
            </div>
            <div className="ps-tabs" role="tablist" aria-label="فلاتر المنتجات">
              {TABS.map((tab, i) => (
                <button
                  key={i}
                  className={`ps-tab ${i === activeTab ? 'ps-tab--active' : ''}`}
                  onClick={() => setActiveTab(i)}
                  role="tab"
                  aria-selected={i === activeTab}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link to="/products" className="ps-section__see-all">
              عرض الكل <ArrowLeft size={15} />
            </Link>
          </div>

          <div className="ps-grid">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} onCart={handleAddToCart} />
            ))}
          </div>

          <div className="ps-dots" aria-hidden="true">
            <span className="ps-dot" />
            <span className="ps-dot ps-dot--active" />
            <span className="ps-dot" />
          </div>
        </section>
      )}

      {/* ── Promo Banners ── */}
      <section className="ps-banners" aria-label="عروض خاصة">
        <div className="ps-banner ps-banner--green" style={{backgroundImage: `url(${settings.dinosaurs_banner_url})`}}>
          <div className="ps-banner__content">
            <span className="ps-banner__eyebrow"><Box size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '0.25rem' }} /> ألعاب ديناصورات</span>
            <h3 className="ps-banner__title">Dinosaurs</h3>
            <p className="ps-banner__sub">اكتشف عالم الديناصورات</p>
            <Link to="/products?category=dinosaurs" className="ps-banner__cta">
              تسوق الآن
            </Link>
          </div>
        </div>
        <div className="ps-banner ps-banner--yellow" style={{backgroundImage: `url(${settings.balloons_banner_url})`}}>
          <div className="ps-banner__content">
            <span className="ps-banner__eyebrow"><Circle size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '0.25rem' }} /> بالونات هيليوم</span>
            <h3 className="ps-banner__title">Balloons</h3>
            <p className="ps-banner__sub">لكل مناسبة وحفلة</p>
            <Link to="/products?category=balloons" className="ps-banner__cta">
              تسوق الآن
            </Link>
          </div>
        </div>
      </section>

      {/* ── Top Rated Section ── */}
      {showTopRated && (
        <section className="ps-section ps-section--alt" aria-labelledby="toprated-title">
          <div className="ps-section__head">
            <div className="ps-section__title-wrap">
              <h2 className="ps-section__title" id="toprated-title">الأعلى تقييماً</h2>
              <div className="ps-section__title-bar" />
            </div>
            <div className="ps-nav-arrows" aria-label="تنقل بين المنتجات">
              <button className="ps-arrow" aria-label="السابق"><ChevronRight size={18} /></button>
              <button className="ps-arrow" aria-label="التالي"><ChevronLeft size={18} /></button>
            </div>
            <Link to="/products" className="ps-section__see-all">
              عرض الكل <ArrowLeft size={15} />
            </Link>
          </div>

          <div className="ps-grid">
            {topRatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onCart={handleAddToCart} />
            ))}
          </div>

          <div className="ps-dots" aria-hidden="true">
            <span className="ps-dot" />
            <span className="ps-dot" />
            <span className="ps-dot ps-dot--active" />
          </div>
        </section>
      )}

    </div>
  )
}

export default ProductSections
