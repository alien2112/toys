import React, { useState } from 'react'
import { ShoppingBag, Tag, Truck, Lock, CreditCard, Smartphone, Building2, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const CartSummary: React.FC = () => {
  const { subtotal, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')

  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 5.00) : 0
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + shipping + tax - discount

  const handleApplyCoupon = () => {
    setCouponError('')
    const code = couponCode.toUpperCase().trim()

    if (code === 'KIDS10') {
      setDiscount(subtotal * 0.1)
      setCouponApplied(true)
    } else if (code === 'WELCOME20') {
      setDiscount(subtotal * 0.2)
      setCouponApplied(true)
    } else if (code === 'SAVE15') {
      setDiscount(subtotal * 0.15)
      setCouponApplied(true)
    } else {
      setCouponError('كود الخصم غير صالح')
      setTimeout(() => setCouponError(''), 3000)
    }
  }

  const handleCheckout = () => {
    navigate('/login?redirect=checkout')
  }

  const progressToFreeShipping = subtotal > 0 && subtotal < 100
    ? ((subtotal / 100) * 100).toFixed(0)
    : 100

  return (
    <div className="cart-summary">
      <div className="cart-summary-header">
        <ShoppingBag size={24} />
        <h2 className="cart-summary-title">ملخص الطلب</h2>
        <Sparkles size={20} className="sparkle-icon" />
      </div>

      <div className="cart-summary-details">
        <div className="summary-row">
          <span className="summary-label">المجموع الفرعي ({totalItems} منتج)</span>
          <span className="summary-value">{subtotal.toFixed(2)} ر.س</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">
            <Truck size={16} />
            الشحن
          </span>
          <span className="summary-value">
            {shipping === 0 ? (
              <span className="free-shipping">مجاني <Sparkles size={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>
            ) : (
              `${shipping.toFixed(2)} ر.س`
            )}
          </span>
        </div>

        {subtotal > 0 && subtotal < 100 && (
          <div className="shipping-progress">
            <div className="shipping-notice">
              أضف {(100 - subtotal).toFixed(2)} ر.س للحصول على شحن مجاني
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressToFreeShipping}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="summary-row">
          <span className="summary-label">الضريبة (5%)</span>
          <span className="summary-value">{tax.toFixed(2)} ر.س</span>
        </div>

        {discount > 0 && (
          <div className="summary-row discount-row">
            <span className="summary-label">
              <Tag size={16} />
              الخصم
            </span>
            <span className="summary-value discount-value">-{discount.toFixed(2)} ر.س</span>
          </div>
        )}

        <div className="summary-divider"></div>

        <div className="summary-row summary-total">
          <span className="summary-label">المجموع الكلي</span>
          <span className="summary-value">{total.toFixed(2)} ر.س</span>
        </div>
      </div>

      {!couponApplied && (
        <div className="coupon-section">
          <input
            type="text"
            placeholder="أدخل كود الخصم"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
            className="coupon-input"
          />
          <button onClick={handleApplyCoupon} className="apply-coupon-button">
            تطبيق
          </button>
        </div>
      )}

      {couponError && (
        <div className="coupon-error">
          {couponError}
        </div>
      )}

      {couponApplied && (
        <div className="coupon-success">
          <Tag size={16} />
          تم تطبيق كود الخصم بنجاح!
        </div>
      )}

      <button
        onClick={handleCheckout}
        className="checkout-button"
        disabled={totalItems === 0}
      >
        <Lock size={20} />
        <span>إتمام الطلب بأمان</span>
      </button>

      <div className="payment-methods">
        <p>طرق الدفع المتاحة:</p>
        <div className="payment-icons">
          <span title="بطاقة ائتمان"><CreditCard size={24} /></span>
          <span title="تحويل بنكي"><Building2 size={24} /></span>
          <span title="دفع إلكتروني"><Smartphone size={24} /></span>
        </div>
      </div>

      {totalItems > 0 && (
        <button onClick={clearCart} className="clear-cart-button">
          إفراغ السلة
        </button>
      )}
    </div>
  )
}

export default CartSummary
