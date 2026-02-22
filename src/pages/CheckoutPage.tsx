import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { apiService } from '../services/api'
import './CheckoutPage.css'

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: string
  popular?: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'الدفع عند الاستلام',
    description: 'ادفع عند استلام الطلب',
    icon: '💵'
  },
  {
    id: 'moyasar',
    name: 'موياسار',
    description: 'الدفع الإلكتروني الآمن',
    icon: '🔒',
    popular: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'الدفع بالبطاقة الائتمانية',
    icon: '💳'
  }
]

const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const { state: cartState, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    city: '',
    address: ''
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Redirect if cart is empty
  React.useEffect(() => {
    if (isAuthenticated && cartState.items.length === 0) {
      navigate('/products')
    }
  }, [isAuthenticated, cartState.items.length, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate all fields
      if (!formData.fullName.trim() || !formData.phone.trim() || 
          !formData.city.trim() || !formData.address.trim()) {
        throw new Error('جميع الحقول مطلوبة')
      }

      // Combine shipping address
      const shippingAddress = `${formData.fullName}\n${formData.phone}\n${formData.city}\n${formData.address}`

      // Step 1: Create order
      setIsCreatingOrder(true)
      const orderData = {
        items: cartState.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: shippingAddress
      }

      const orderResult = await apiService.createOrder(orderData)
      setIsCreatingOrder(false)

      // Step 2: Process payment based on selected method
      if (selectedPaymentMethod === 'cod') {
        // For COD, create payment and redirect to orders
        const paymentData = {
          order_id: orderResult.order_id,
          gateway: 'cod'
        }
        await apiService.createPayment(paymentData)
        clearCart()
        navigate('/orders', { state: { newOrderId: orderResult.order_id } })
      } else {
        // For online payments, create payment intent and redirect
        const paymentData = {
          order_id: orderResult.order_id,
          gateway: selectedPaymentMethod
        }
        
        const paymentResult = await apiService.createPayment(paymentData)
        
        // Redirect to payment gateway
        if (selectedPaymentMethod === 'moyasar' && paymentResult.payment_url) {
          window.location.href = paymentResult.payment_url
        } else if (selectedPaymentMethod === 'stripe' && paymentResult.checkout_url) {
          window.location.href = paymentResult.checkout_url
        } else {
          throw new Error('فشل في توجيهك إلى بوابة الدفع')
        }
      }
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء الطلب')
      setIsCreatingOrder(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || cartState.items.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="checkout-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="checkout-header">إتمام الطلب</h1>
        
        <div className="checkout-layout">
          {/* Shipping Form */}
          <div className="checkout-form-section">
            <div className="checkout-card">
              <h2 className="checkout-card-title">معلومات الشحن</h2>
            
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="checkout-form-group">
                  <label htmlFor="fullName" className="checkout-form-label">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="checkout-form-input"
                  />
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="phone" className="checkout-form-label">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="checkout-form-input"
                  />
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="city" className="checkout-form-label">
                    المدينة
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="checkout-form-input"
                  />
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="address" className="checkout-form-label">
                    العنوان
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="checkout-form-textarea"
                  />
                </div>

                {error && (
                  <div className="checkout-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="checkout-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="checkout-spinner"></div>
                      {isCreatingOrder ? 'جاري إنشاء الطلب...' : 'جاري معالجة الدفع...'}
                    </>
                  ) : (
                    selectedPaymentMethod === 'cod' ? 'إتمام الطلب' : 'المتابعة للدفع'
                  )}
                </button>
              </form>
            </div>

            {/* Payment Methods */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">طريقة الدفع</h2>
              
              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-method-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="payment-method-radio"
                    />
                    <div className="payment-method-content">
                      <div className="payment-method-icon">{method.icon}</div>
                      <div className="payment-method-info">
                        <div className="payment-method-name">
                          {method.name}
                          {method.popular && (
                            <span className="payment-method-badge">
                              الأكثر شيوعاً
                            </span>
                          )}
                        </div>
                        <p className="payment-method-description">{method.description}</p>
                      </div>
                      <div className="payment-method-indicator">
                        <div className="payment-method-indicator-dot"></div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedPaymentMethod !== 'cod' && (
                <div className="payment-security-notice">
                  <svg className="payment-security-notice-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="payment-security-notice-text">
                    <p className="payment-security-notice-title">معلومات الدفع الآمنة</p>
                    <p>سيتم توجيهك إلى بوابة دفع آمنة لإتمام عملية الشراء.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="checkout-card">
              <h2 className="checkout-card-title">ملخص الطلب</h2>
              
              <div className="order-summary-items">
                {cartState.items.map((item) => (
                  <div key={item.id} className="order-summary-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-summary-item-image"
                    />
                    <div className="order-summary-item-details">
                      <h3 className="order-summary-item-name">{item.name}</h3>
                      <p className="order-summary-item-quantity">الكمية: {item.quantity}</p>
                    </div>
                    <div className="order-summary-item-price">
                      {(item.price * item.quantity).toFixed(2)} SAR
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary-totals">
                <div className="order-summary-row">
                  <span className="order-summary-label">المجموع الفرعي</span>
                  <span className="order-summary-value">{subtotal.toFixed(2)} SAR</span>
                </div>
                <div className="order-summary-row">
                  <span className="order-summary-label">الشحن</span>
                  <span className="order-summary-value">0 SAR</span>
                </div>
                <div className="order-summary-row total">
                  <span className="order-summary-label">المجموع</span>
                  <span className="order-summary-value">{subtotal.toFixed(2)} SAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
