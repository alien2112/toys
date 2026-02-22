// src/components/ProductInfo.tsx

import { useState } from 'react';
import { Product } from '../types/product.types';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Heart, Share2, Check } from 'lucide-react';

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  const handleAddToCart = () => {
    addToCart({
      id: parseInt(product.id.toString()),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  const getStockStatus = () => {
    if (isOutOfStock) return { text: 'نفذت الكمية', cls: 'out' };
    if (isLowStock) return { text: `كمية محدودة (${product.stock} متبقي)`, cls: 'low' };
    return { text: 'متوفر في المخزون', cls: 'in' };
  };

  const stock = getStockStatus();
  const rating = product.rating || 4.5;

  const renderStars = (r: number) => {
    const full = Math.floor(r);
    const half = r % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <>
        {Array(full).fill(0).map((_, i) => <Star key={`f${i}`} size={16} fill="currentColor" strokeWidth={0} />)}
        {half === 1 && <Star key="h" size={16} fill="currentColor" strokeWidth={0} />}
        {Array(empty).fill(0).map((_, i) => <Star key={`e${i}`} size={16} fill="none" strokeWidth={1.5} style={{ opacity: .3 }} />)}
      </>
    );
  };

  return (
    <div className="pdp-info">
      {/* Category */}
      {product.category && (
        <span className="pdp-info__cat">{product.category}</span>
      )}

      {/* Title */}
      <h1 className="pdp-info__title">{product.name}</h1>

      {/* Rating row */}
      <div className="pdp-info__meta">
        <div className="pdp-info__stars">{renderStars(rating)}</div>
        <span className="pdp-info__rating-num">{rating.toFixed(1)}</span>
        <span className="pdp-info__reviews-link">
          ({product.reviewsCount || 0} تقييم)
        </span>
      </div>

      {/* Price box */}
      <div className="pdp-price-box">
        <div>
          <span className="pdp-price-box__current">
            {product.price.toFixed(2)}
          </span>
          <span className="pdp-price-box__currency"> ر.س</span>
        </div>
      </div>

      {/* Stock */}
      <div className={`pdp-stock pdp-stock--${stock.cls}`}>
        <span className="pdp-stock__dot" />
        {stock.text}
      </div>

      {/* Description */}
      {(product.longDescription || product.description) && (
        <div className="pdp-info__desc">
          {product.longDescription || product.description}
        </div>
      )}

      {/* Actions */}
      {!isOutOfStock ? (
        <div className="pdp-actions">
          {/* Quantity */}
          <div className="pdp-qty">
            <label className="pdp-qty__label">الكمية:</label>
            <div className="pdp-qty-ctrl">
              <button
                className="pdp-qty-ctrl__btn"
                onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                disabled={quantity <= 1}
                aria-label="تقليل الكمية"
              >
                −
              </button>
              <input
                type="number"
                className="pdp-qty-ctrl__val"
                value={quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 1 && v <= product.stock) setQuantity(v);
                }}
                min={1}
                max={product.stock}
                aria-label="الكمية"
              />
              <button
                className="pdp-qty-ctrl__btn"
                onClick={() => quantity < product.stock && setQuantity(q => q + 1)}
                disabled={quantity >= product.stock}
                aria-label="زيادة الكمية"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="pdp-btn-row">
            <button
              className={`pdp-btn-cart${addedToCart ? ' added' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {addedToCart ? <><Check size={18} /> تمت الإضافة</> : <><ShoppingCart size={18} /> أضف إلى السلة</>}
            </button>
            <button
              className="pdp-btn-buynow"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              اشتر الآن
            </button>
          </div>

          {/* Extra actions */}
          <div className="pdp-extra-actions">
            <button
              className={`pdp-icon-btn${wishlisted ? ' wishlisted' : ''}`}
              onClick={() => setWishlisted(w => !w)}
              aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} /> المفضلة
            </button>
            <button className="pdp-icon-btn" aria-label="مشاركة المنتج">
              <Share2 size={16} /> مشاركة
            </button>
          </div>
        </div>
      ) : (
        <div className="pdp-out-msg">
          <p>هذا المنتج غير متوفر حالياً. سيتم إعادة توفيره قريباً.</p>
        </div>
      )}
    </div>
  );
};
