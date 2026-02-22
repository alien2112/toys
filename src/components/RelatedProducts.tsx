// src/components/RelatedProducts.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface RelatedProductsProps {
  products: Product[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <div className="pdp-related__slider">
      {products.map((product) => (
        <Link key={product.id} to={`/products/${product.id}`} className="pdp-rel-card">
          <div className="pdp-rel-card__img-wrap">
            <img
              src={product.image || '/products/placeholder.svg'}
              alt={product.name}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
            />
          </div>
          <div className="pdp-rel-card__body">
            <h3 className="pdp-rel-card__name">{product.name}</h3>
            <p className="pdp-rel-card__price">{product.price.toFixed(2)} ر.س</p>
            <button
              className="pdp-rel-card__btn"
              onClick={() => {
                addToCart(product as any);
              }}
            >
              <><ShoppingCart size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.2rem' }} /> أضف للسلة</>
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};
