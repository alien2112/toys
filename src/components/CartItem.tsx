import React, { useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { CartItem as CartItemType } from '../types/cart.types'

interface CartItemProps {
  item: CartItemType
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart()
  const [isRemoving, setIsRemoving] = useState(false)
  const [quantityChanging, setQuantityChanging] = useState(false)

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      removeFromCart(item.id)
    }, 400)
  }

  const handleIncrease = () => {
    setQuantityChanging(true)
    increaseQuantity(item.id)
    setTimeout(() => setQuantityChanging(false), 300)
  }

  const handleDecrease = () => {
    setQuantityChanging(true)
    decreaseQuantity(item.id)
    setTimeout(() => setQuantityChanging(false), 300)
  }

  return (
    <div className={`cart-item ${isRemoving ? 'removing' : ''}`}>
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} loading="lazy" />
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <p className="cart-item-category">{item.category}</p>
        <div className="cart-item-price-mobile">
          <span className="price-label">السعر:</span>
          <span className="price-value">{item.price.toFixed(2)} ر.س</span>
        </div>
      </div>

      <div className="cart-item-price-desktop">
        <p className="price-value">{item.price.toFixed(2)} ر.س</p>
      </div>

      <div className="quantity-controls">
        <button
          onClick={handleDecrease}
          className="quantity-button"
          aria-label="تقليل الكمية"
          disabled={item.quantity <= 1}
        >
          <Minus size={16} />
        </button>
        <span className={`quantity-value ${quantityChanging ? 'changing' : ''}`}>
          {item.quantity}
        </span>
        <button
          onClick={handleIncrease}
          className="quantity-button"
          aria-label="زيادة الكمية"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="cart-item-total">
        <p className="item-total-price">{(item.price * item.quantity).toFixed(2)} ر.س</p>
      </div>

      <button
        onClick={handleRemove}
        className="remove-button"
        aria-label="حذف من السلة"
      >
        <X size={20} />
      </button>
    </div>
  )
}

export default CartItem
