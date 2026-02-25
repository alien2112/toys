// src/components/RelatedProducts.tsx

import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types/product.types';
import './RelatedProducts.css';

interface RelatedProductsProps {
  products: Product[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="related-products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
