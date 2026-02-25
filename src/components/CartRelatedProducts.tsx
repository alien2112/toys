import React, { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { productsData } from '../data/productsData'
import { CartItem } from '../types/cart.types'
import { ProductCard } from './ProductCard'
import './RelatedProducts.css'

interface RelatedProductsProps {
  currentCartItems: CartItem[]
}

const CartRelatedProducts: React.FC<RelatedProductsProps> = ({ currentCartItems }) => {
  const relatedProducts = useMemo(() => {
    const cartProductIds = currentCartItems.map(item => item.id.toString())
    const cartCategories = [...new Set(currentCartItems.map(item => item.category))]

    return productsData
      .filter(product =>
        !cartProductIds.includes(product.id.toString()) &&
        cartCategories.includes(product.category)
      )
      .slice(0, 4)
  }, [currentCartItems])

  if (relatedProducts.length === 0) return null

  // Transform productsData items to match the ProductCard type requirements
  const transformedProducts = relatedProducts.map(product => ({
    ...product,
    id: product.id.toString(),
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    stock: 10, // Default to a positive stock for local data
    rating: 4.5,
  }))

  return (
    <div className="cart-related-section" style={{ marginTop: 'var(--space-4xl)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-2xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <Sparkles size={20} color="var(--brand-accent)" />
        قد يعجبك أيضاً
      </h2>
      <div className="related-products-grid">
        {transformedProducts.map(product => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </div>
  )
}

export default CartRelatedProducts
