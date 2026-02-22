import React, { useState, useEffect } from 'react'
import { Package, Calendar, DollarSign, Truck, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import './OrdersPage.css'

interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  price: number
}

interface Order {
  id: number
  user_id: number
  total_amount: number
  status: string
  shipping_address: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

const OrdersPage: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiService.getUserOrders(user.id)
        setOrders(response.orders || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('فشل في تحميل الطلبات')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'تم التوصيل'
      case 'shipping': return 'قيد الشحن'
      case 'processed': return 'تمت المعالجة'
      case 'pending': return 'قيد الانتظار'
      case 'cancelled': return 'ملغي'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered'
      case 'shipping': return 'status-shipping'
      case 'processed': return 'status-processed'
      case 'pending': return 'status-pending'
      case 'cancelled': return 'status-cancelled'
      default: return ''
    }
  }

  const getStatusStep = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'pending': return 1
      case 'processed': return 2
      case 'shipping': return 3
      case 'delivered': return 4
      case 'cancelled': return 0
      default: return 1
    }
  }

  const OrderProgressStepper = ({ currentStatus }: { currentStatus: string }) => {
    const currentStep = getStatusStep(currentStatus)
    const steps = [
      { key: 'pending', label: 'قيد الانتظار', icon: <AlertCircle size={16} /> },
      { key: 'processed', label: 'تمت المعالجة', icon: <Package size={16} /> },
      { key: 'shipping', label: 'قيد الشحن', icon: <Truck size={16} /> },
      { key: 'delivered', label: 'تم التوصيل', icon: <Calendar size={16} /> }
    ]

    return (
      <div className="order-progress">
        <div className="progress-steps">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber <= currentStep
            const isCurrent = step.key === currentStatus.toLowerCase()
            const isCancelled = currentStatus.toLowerCase() === 'cancelled'

            return (
              <div key={step.key} className="progress-step">
                <div className={`step-indicator ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isCancelled ? 'cancelled' : ''}`}>
                  {isCompleted && !isCurrent ? '✓' : step.icon}
                </div>
                <span className={`step-label ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <Package size={40} />
            <h1 className="orders-title">طلباتي</h1>
            <p className="orders-subtitle">يرجى تسجيل الدخول لعرض طلباتك</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <Package size={40} />
            <h1 className="orders-title">طلباتي</h1>
            <p className="orders-subtitle">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <Package size={40} />
            <h1 className="orders-title">طلباتي</h1>
            <p className="orders-subtitle">تتبع جميع طلباتك من هنا</p>
          </div>
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <Package size={40} />
            <h1 className="orders-title">طلباتي</h1>
            <p className="orders-subtitle">لا توجد طلبات حتى الآن</p>
          </div>
          <div className="empty-orders">
            <Package size={80} />
            <h3>لم تقم بأي طلبات بعد</h3>
            <p>ابدأ التسوق الآن واستمتع بمنتجاتنا الرائعة!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <Package size={40} />
          <h1 className="orders-title">طلباتي</h1>
          <p className="orders-subtitle">تتبع جميع طلباتك من هنا ({orders.length} طلب)</p>
        </div>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span className="order-label">رقم الطلب:</span>
                  <span className="order-value">#{order.id}</span>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="order-details">
                <div className="order-detail">
                  <Calendar size={18} />
                  <span>{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="order-detail">
                  <Package size={18} />
                  <span>{order.items?.length || 0} منتجات</span>
                </div>
                <div className="order-detail">
                  <DollarSign size={18} />
                  <span>{parseFloat(order.total_amount.toString()).toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Progress Stepper - Always Visible */}
              <div className="order-tracking-section">
                <h4 className="tracking-title">تتبع الطلب</h4>
                <OrderProgressStepper currentStatus={order.status} />
              </div>

              {/* Expandable Details */}
              {expandedOrder === order.id && (
                <div className="order-expanded-details">
                  <div className="order-items">
                    <h4>المنتجات</h4>
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.product_name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{parseFloat(item.price.toString()).toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-shipping">
                    <h4>عنوان الشحن</h4>
                    <p className="shipping-address">{order.shipping_address}</p>
                  </div>
                  
                  {order.updated_at && (
                    <div className="order-updated">
                      <h4>آخر تحديث</h4>
                      <p>{new Date(order.updated_at).toLocaleDateString('ar-EG')} {new Date(order.updated_at).toLocaleTimeString('ar-EG')}</p>
                    </div>
                  )}
                </div>
              )}

              <button 
                className="order-track-button"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                {expandedOrder === order.id ? (
                  <>
                    <Package size={18} />
                    إخفاء التفاصيل
                  </>
                ) : (
                  <>
                    <Truck size={18} />
                    عرض التفاصيل
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrdersPage
