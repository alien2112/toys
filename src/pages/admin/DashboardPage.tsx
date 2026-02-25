import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, Settings, Plus, Home } from 'lucide-react'
import './DashboardPage.css'

interface DashboardStats {
  total_orders: number
  total_revenue: number
  total_products: number
  total_users: number
}

interface Order {
  id: number
  user_id: number
  total_amount: number
  status: string
  created_at: string
  email: string
  first_name: string
  last_name: string
}

interface Product {
  id: number
  name: string
  stock: number
  price: number
}

const statusTranslations: Record<string, string> = {
  'pending': 'قيد الانتظار',
  'processing': 'قيد المعالجة',
  'shipped': 'تم الشحن',
  'delivered': 'تم التوصيل',
  'cancelled': 'ملغي'
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('http://localhost:8000/api/admin/dashboard', {
        headers
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.data.stats)
        setRecentOrders(data.data.recent_orders)
        setLowStockProducts(data.data.low_stock_products)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader-spinner"></div>
        <p>جاري تحميل لوحة التحكم...</p>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="admin-dashboard">
      {/* Modern Header */}
      <div className="admin-header">
        <div className="admin-header-title-wrap">
          <h1>لوحة التحكم المتقدمة</h1>
          <span className="admin-header-date">{currentDate}</span>
        </div>

        <div className="admin-actions">
          <button onClick={() => navigate('/')} className="admin-action-btn btn-tertiary">
            <Home size={18} />
            العودة للمتجر
          </button>
          <button onClick={() => navigate('/admin/products')} className="admin-action-btn btn-primary">
            <Plus size={18} />
            منتج جديد
          </button>
          <button onClick={() => navigate('/admin/settings')} className="admin-action-btn btn-secondary">
            <Settings size={18} />
            الإعدادات
          </button>
          <button onClick={handleLogout} className="logout-button">تسجيل الخروج</button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card" style={{ '--stat-color': '#667eea', '--stat-shadow': 'rgba(102, 126, 234, 0.3)' } as React.CSSProperties}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #667eea 0%, #5a67d8 100%)' }}>
            <ShoppingCart size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">إجمالي الطلبات</p>
            <p className="stat-value">{stats?.total_orders || 0}</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#48bb78', '--stat-shadow': 'rgba(72, 187, 120, 0.3)' } as React.CSSProperties}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}>
            <DollarSign size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">إجمالي الإيرادات</p>
            <p className="stat-value">{stats?.total_revenue?.toFixed(2) || '0.00'} <span style={{ fontSize: '1rem', color: '#718096' }}>ر.س</span></p>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#ed8936', '--stat-shadow': 'rgba(237, 137, 54, 0.3)' } as React.CSSProperties}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' }}>
            <Package size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">إجمالي المنتجات</p>
            <p className="stat-value">{stats?.total_products || 0}</p>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#9f7aea', '--stat-shadow': 'rgba(159, 122, 234, 0.3)' } as React.CSSProperties}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)' }}>
            <Users size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">إجمالي العملاء</p>
            <p className="stat-value">{stats?.total_users || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              الطلبات الأخيرة
            </h2>
            <a href="#" className="panel-action">عرض الكل</a>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>بيانات العميل</th>
                  <th>المبلغ الإجمالي</th>
                  <th>الحالة</th>
                  <th>تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id">#{order.id}</span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {order.first_name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{order.first_name} {order.last_name}</span>
                          <span className="user-email">{order.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="amount-cell">{order.total_amount} ر.س</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {statusTranslations[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ color: '#718096' }}>{new Date(order.created_at).toLocaleDateString('ar-SA')}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-data">
                        <ShoppingCart size={40} />
                        <p>لا توجد طلبات جديدة للعرض حالياً</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header" style={{ background: '#fffaf0', borderBottomColor: '#feebc8' }}>
            <h2 className="panel-title" style={{ color: '#dd6b20' }}>
              <AlertTriangle size={20} />
              تحذير المخزون
            </h2>
            <a href="/admin/products" className="panel-action" style={{ background: '#feebc8', color: '#c05621' }}>إدارة</a>
          </div>
          <div className="stock-list">
            {lowStockProducts.length > 0 ? lowStockProducts.map(product => (
              <div key={product.id} className="stock-item">
                <div className="stock-product-info">
                  <div className="stock-product-icon">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="stock-product-name">{product.name}</h4>
                    <p className="stock-product-price">{product.price} ر.س</p>
                  </div>
                </div>
                <div className="stock-level">
                  <span className="stock-count">{product.stock}</span>
                  <span className="stock-label">متبقي</span>
                </div>
              </div>
            )) : (
              <div className="empty-data">
                <Package size={40} style={{ color: '#48bb78' }} />
                <p>جميع المنتجات متوفرة بكميات كافية</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
