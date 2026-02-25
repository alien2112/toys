// src/components/ProductCard.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product.types';
import { useCart } from '../context/CartContext';
import { Star, Eye, Heart, ShoppingCart, Check } from 'lucide-react';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  listView?: boolean;
}

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="pc__stars-icons" aria-label={`تقييم ${rating} من 5`}>
      {Array(full).fill(0).map((_, i) => <Star key={`f${i}`} size={14} fill="currentColor" strokeWidth={0} />)}
      {half === 1 && <Star key="h" size={14} fill="currentColor" strokeWidth={0} style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {Array(empty).fill(0).map((_, i) => <Star key={`e${i}`} size={14} fill="none" strokeWidth={1.5} style={{ opacity: .3 }} />)}
    </div>
  );
};

export const ProductCard = ({ product, listView = false }: ProductCardProps) => {
  const { id, name, description, price, image, rating, stock, category } = product;
  const { addToCart } = useCart();

  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const displayImage = image || '/products/placeholder.svg';
  const displayRating = rating || 4.5;
  const displayReviews = product.reviewsCount || Math.floor(Math.random() * 80) + 12;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock > 0 && !added) {
      addToCart({
        id: typeof id === 'string' ? parseInt(id) : id,
        name,
        price: typeof price === 'string' ? parseFloat(price) : price,
        image: displayImage,
        category: category || 'ألعاب',
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(w => !w);
  };

  return (
    <Link to={`/products/${id}`} className="pc" aria-label={name}>

      {/* ── Image area ── */}
      <div className="pc__img-wrap">
        <img
          src={displayImage}
          alt={name}
          className="pc__img"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
        />

        {/* Hover overlay */}
        <div className="pc__overlay">
          <button
            className="pc__overlay-btn"
            aria-label="عرض سريع"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            title="عرض سريع"
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Badges */}
        {stock < 10 && stock > 0 && (
          <span className="pc__badge pc__badge--limited">كمية محدودة</span>
        )}
        {stock === 0 && (
          <span className="pc__badge pc__badge--out">نفذت الكمية</span>
        )}

        {/* Wishlist */}
        <button
          className={`pc__wishlist${wishlisted ? ' active' : ''}`}
          aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          onClick={handleWishlist}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="pc__body">
        {category && (
          <span className="pc__category">{category}</span>
        )}

        <h3 className="pc__name">{name}</h3>

        {/* Stars */}
        <div className="pc__stars">
          <StarRating rating={displayRating} />
          <span className="pc__stars-count">({displayReviews})</span>
        </div>

        {listView && description && (
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="pc__footer">
        <div className="pc__pricing">
          <span className="pc__price-current">
            {parseFloat(price.toString()).toFixed(2)} ر.س
          </span>
        </div>

        <button
          className={`pc__add-btn${added ? ' added' : ''}`}
          disabled={stock === 0}
          aria-label={`إضافة ${name} إلى السلة`}
          onClick={handleAddToCart}
        >
          {added ? (
            <><Check size={16} /> تمت الإضافة</>
          ) : stock === 0 ? (
            'نفذ المخزون'
          ) : (
            <><ShoppingCart size={16} /> أضف للسلة</>
          )}
        </button>
      </div>
    </Link>
  );
};
