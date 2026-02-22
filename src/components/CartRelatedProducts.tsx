import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { productsData } from '../data/productsData'
import { CartItem } from '../types/cart.types'
import { useCart } from '../context/CartContext'

interface RelatedProductsProps {
  currentCartItems: CartItem[]
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentCartItems }) => {
  const { addToCart } = useCart()

  const relatedProducts = useMemo(() => {
    const cartProductIds = currentCartItems.map(item => item.id)
    const cartCategories = [...new Set(currentCartItems.map(item => item.category))]

    return productsData
      .filter(product =>
        !cartProductIds.includes(product.id) &&
        cartCategories.includes(product.category)
      )
      .slice(0, 4)
  }, [currentCartItems])

  if (relatedProducts.length === 0) return null

  return (
    <div className="related-products-section">
      <h2 className="related-products-title">قد يعجبك أيضاً</h2>
      <div className="related-products-grid">
        {relatedProducts.map(product => (
          <div key={product.id} className="related-product-card">
            <Link to={`/products/${product.id}`} className="related-product-image">
              <img src={product.image} alt={product.name} loading="lazy" />
            </Link>
            <div className="related-product-info">
              <Link to={`/products/${product.id}`}>
                <h3 className="related-product-name">{product.name}</h3>
              </Link>
              <p className="related-product-price">{product.price.toFixed(2)} ر.س</p>
              <button
                onClick={() => addToCart({ ...product, id: parseInt(product.id) })}
                className="related-product-add-button"
              >
                <ShoppingBag size={18} />
                أضف للسلة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
