import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Product } from '../types/cart.types'

interface AddToCartButtonProps {
  product: Product
  className?: string
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, className = '' }) => {
  const { addToCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading || isAdded) return
    
    setIsLoading(true)
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 600))
    
    addToCart(product)
    setIsAdded(true)
    setIsLoading(false)
    
    // Reset after 2 seconds
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <button 
      onClick={handleClick} 
      className={`add-to-cart-button btn-ripple ${isAdded ? 'added' : ''} ${isLoading ? 'btn-loading' : ''} ${className}`}
      disabled={isLoading}
    >
      <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isAdded ? (
          <>
            <Check size={18} />
            تمت الإضافة
          </>
        ) : (
          <>
            <ShoppingCart size={18} className="btn-icon-slide" />
            أضف إلى السلة
          </>
        )}
      </span>
      {isLoading && <span className="btn-spinner"></span>}
    </button>
  )
}

export default AddToCartButton
