import React from 'react'
import { ShoppingCart, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'
import CartSummary from '../components/CartSummary'
import RelatedProducts from '../components/CartRelatedProducts'
import './CartPage.css'

const CartPage: React.FC = () => {
  const { state } = useCart()

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-wrapper">
            <h1 className="cart-title">
              <ShoppingCart className="cart-icon" size={32} />
              سلة التسوق
            </h1>
            {state.items.length > 0 && (
              <p className="cart-subtitle">لديك {state.items.length} منتجات في سلتك</p>
            )}
          </div>
          <Link to="/products" className="continue-shopping-link">
            متابعة التسوق
            <ArrowRight size={18} />
          </Link>
        </div>

        {state.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-animation">
              <div className="empty-cart-icon">
                <ShoppingCart size={48} strokeWidth={2} />
              </div>
            </div>
            <h2 className="empty-cart-title">سلة التسوق فارغة</h2>
            <p className="empty-cart-text">اكتشف أحدث الألعاب وأضفها إلى سلتك لتبدأ متعة التسوق</p>
            <Link to="/products" className="empty-continue-button">
              <Sparkles size={18} />
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-content">
              {/* Left Column: Cart Items */}
              <div className="cart-items-section">
                {state.items.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Right Column: Order Summary */}
              <div className="cart-summary-section">
                <CartSummary />
              </div>
            </div>

            <RelatedProducts currentCartItems={state.items} />
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
