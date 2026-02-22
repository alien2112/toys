// src/components/ProductGrid.tsx

import { Product } from '../types/product.types';
import { ProductCard } from './ProductCard';
import { Search } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  listView?: boolean;
}

export const ProductGrid = ({ products, listView = false }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="pp-grid__empty">
        <div className="pp-grid__empty-icon"><Search size={48} /></div>
        <h3>لم يتم العثور على منتجات</h3>
        <p>حاول تعديل الفلاتر أو كلمات البحث للعثور على ما تبحث عنه.</p>
      </div>
    );
  }

  return (
    <div className={`pp-grid${listView ? ' list-view' : ''}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} listView={listView} />
      ))}
    </div>
  );
};
