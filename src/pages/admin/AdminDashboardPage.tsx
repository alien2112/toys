import React, { useEffect, useState } from 'react'
import { Package, DollarSign, Users, ShoppingCart, AlertTriangle, PackageOpen, Activity, Clock, ArrowUp, ArrowDown, MoreVertical, Eye, RefreshCw } from 'lucide-react'
import { arabicTranslations } from '../../data/arabicTranslations'

interface DashboardStats {
  total_orders: number
  total_revenue: number
  total_products: number
  total_users: number
}

interface Order {
  id: number
  user_email: string
  total_amount: number
  status: string
  created_at: string
}

interface Product {
  id: number
  name: string
  stock: number
  price: number
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
        setRecentOrders(data.data.recent_orders || [])
        setLowStockProducts(data.data.low_stock_products || [])
      } else {
        throw new Error(data.message || 'Failed to load dashboard data')
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'paid': 'bg-blue-50 text-blue-700 border-blue-200',
      'processing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'shipped': 'bg-purple-50 text-purple-700 border-purple-200',
      'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200',
      'refunded': 'bg-gray-50 text-gray-700 border-gray-200'
    }
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getStatusText = (status: string) => {
    const translations: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'paid': 'مدفوع',
      'processing': 'قيد المعالجة',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي',
      'refunded': 'مسترد'
    }
    return translations[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-right" dir="rtl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">{arabicTranslations.error}</h3>
            <div className="text-sm text-red-700 mb-4">
              <p>{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <ArrowUp className="h-3 w-3" />
                <span className="text-sm font-semibold">+12%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">{arabicTranslations.totalOrders}</h3>
              <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stats?.total_orders || 0}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>آخر 30 يوم</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <ArrowUp className="h-3 w-3" />
                <span className="text-sm font-semibold">+8%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">{arabicTranslations.totalRevenue}</h3>
              <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stats?.total_revenue?.toFixed(2) || '0.00'} {arabicTranslations.currency}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Activity className="h-3 w-3" />
                <span>إجمالي الإيرادات</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <ArrowDown className="h-3 w-3" />
                <span className="text-sm font-semibold">-3%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">{arabicTranslations.totalProducts}</h3>
              <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stats?.total_products || 0}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <PackageOpen className="h-3 w-3" />
                <span>المخزون المتاح</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <ArrowUp className="h-3 w-3" />
                <span className="text-sm font-semibold">+15%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">{arabicTranslations.totalUsers}</h3>
              <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stats?.total_users || 0}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Eye className="h-3 w-3" />
                <span>المستخدمون النشطون</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {arabicTranslations.recentOrders}
              </h3>
              <button className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div key={order.id} className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300 group" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">طلب #{order.id}</div>
                      <div className="text-sm text-gray-500">{order.user_email}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">{order.total_amount} {arabicTranslations.currency}</div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">{arabicTranslations.noOrdersFound}</p>
                <p className="text-sm text-gray-400 mt-2">سيظهر الطلبات الجديدة هنا</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {arabicTranslations.lowStockAlert}
              </h3>
              <button className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product, index) => (
                <div key={product.id} className="px-6 py-4 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-300 group" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.price} {arabicTranslations.currency}</div>
                    </div>
                    <div className={`text-left ${product.stock <= 5 ? 'text-red-600' : 'text-amber-600'}`}>
                      <div className="text-sm font-bold">{product.stock}</div>
                      <div className="text-xs">بالمخزون</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageOpen className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-500 font-medium">{arabicTranslations.allProductsWellStocked}</p>
                <p className="text-sm text-gray-400 mt-2">جميع المنتجات متوفرة بالمخزون</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
