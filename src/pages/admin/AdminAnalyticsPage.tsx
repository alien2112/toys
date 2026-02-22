import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Download, Calendar, BarChart3, PieChart, Activity } from 'lucide-react'
import { apiService } from '../../services/api'
import './AdminAnalyticsPage.css'

interface KPICard {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
}

interface SalesData {
  date: string
  orders: number
  revenue: number
  customers: number
  avg_order_value: number
}

interface TopProduct {
  name: string
  id: number
  total_sold: number
  total_revenue: number
}

interface CategorySale {
  name: string
  total_sold: number
  total_revenue: number
}

interface PaymentMethod {
  payment_method: string
  count: number
  revenue: number
}

interface AnalyticsData {
  daily_sales: SalesData[]
  top_products: TopProduct[]
  category_sales: CategorySale[]
  payment_methods: PaymentMethod[]
  kpis: {
    total_orders: number
    total_revenue: number
    total_customers: number
    avg_order_value: number
    repeat_orders: number
    revenue_growth: number
    orders_growth: number
  }
}

const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      })
      const response = await apiService.get<AnalyticsData>(`/admin/analytics/sales?${params}`)
      setData(response)
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const handleExport = async (type: string) => {
    try {
      const params = new URLSearchParams({
        type,
        start_date: dateRange.start,
        end_date: dateRange.end
      })
      
      window.open(`/api/admin/analytics/export?${params}`, '_blank')
    } catch (err: any) {
      console.error('Export failed:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-KW').format(num)
  }

  const kpiCards: KPICard[] = data ? [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.kpis.total_revenue),
      change: data.kpis.revenue_growth,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: formatNumber(data.kpis.total_orders),
      change: data.kpis.orders_growth,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'blue'
    },
    {
      title: 'Customers',
      value: formatNumber(data.kpis.total_customers),
      icon: <Users className="w-5 h-5" />,
      color: 'purple'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(data.kpis.avg_order_value),
      icon: <Package className="w-5 h-5" />,
      color: 'orange'
    }
  ] : []

  if (loading) {
    return (
      <div className="admin-analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <div className="analytics-loading">
            <div className="loading-spinner"></div>
            <span>Loading analytics data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <div className="analytics-error">
            <span>{error}</span>
            <button onClick={fetchAnalytics} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>Analytics Dashboard</h1>
          <p>Track your business performance and customer insights</p>
        </div>
        <div className="header-actions">
          <div className="date-range-selector">
            <Calendar className="w-4 h-4" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="date-input"
            />
          </div>
          <div className="export-buttons">
            <button 
              onClick={() => handleExport('sales')}
              className="export-btn"
            >
              <Download className="w-4 h-4" />
              Export Sales
            </button>
            <button 
              onClick={() => handleExport('products')}
              className="export-btn"
            >
              <Download className="w-4 h-4" />
              Export Products
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        {kpiCards.map((kpi, index) => (
          <div key={index} className={`kpi-card kpi-card-${kpi.color}`}>
            <div className="kpi-card-header">
              <div className="kpi-icon">{kpi.icon}</div>
              <div className="kpi-title">{kpi.title}</div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            {kpi.change !== undefined && (
              <div className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                {kpi.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(kpi.change)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <BarChart3 className="w-5 h-5" />
              Revenue Over Time
            </h3>
          </div>
          <div className="chart-content">
            {data?.daily_sales && data.daily_sales.length > 0 ? (
              <div className="revenue-chart">
                {data.daily_sales.map((day, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${(day.revenue / Math.max(...data.daily_sales.map(d => d.revenue))) * 100}%` 
                      }}
                    />
                    <div className="chart-label">
                      <div className="chart-value">{formatCurrency(day.revenue)}</div>
                      <div className="chart-date">{new Date(day.date).toLocaleDateString('en-KW', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </div>
        </div>

        {/* Category Sales */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <PieChart className="w-5 h-5" />
              Sales by Category
            </h3>
          </div>
          <div className="chart-content">
            {data?.category_sales && data.category_sales.length > 0 ? (
              <div className="category-chart">
                {data.category_sales.map((category, index) => {
                  const total = data.category_sales.reduce((sum, cat) => sum + cat.total_revenue, 0)
                  const percentage = (category.total_revenue / total) * 100
                  
                  return (
                    <div key={index} className="category-item">
                      <div className="category-info">
                        <div className="category-name">{category.name}</div>
                        <div className="category-stats">
                          <span>{formatCurrency(category.total_revenue)}</span>
                          <span className="category-percentage">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="tables-grid">
        {/* Top Products */}
        <div className="table-card">
          <div className="table-header">
            <h3>
              <Activity className="w-5 h-5" />
              Top Selling Products
            </h3>
          </div>
          <div className="table-content">
            {data?.top_products && data.top_products.length > 0 ? (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_products.map((product, index) => (
                    <tr key={index}>
                      <td className="product-name">{product.name}</td>
                      <td>{formatNumber(product.total_sold)}</td>
                      <td>{formatCurrency(product.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="table-card">
          <div className="table-header">
            <h3>
              <DollarSign className="w-5 h-5" />
              Payment Methods
            </h3>
          </div>
          <div className="table-content">
            {data?.payment_methods && data.payment_methods.length > 0 ? (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payment_methods.map((method, index) => (
                    <tr key={index}>
                      <td className="payment-method">
                        <span className="method-badge">
                          {method.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : method.payment_method}
                        </span>
                      </td>
                      <td>{formatNumber(method.count)}</td>
                      <td>{formatCurrency(method.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          onClick={() => apiService.post('/admin/analytics/update-summaries')}
          className="action-btn"
        >
          <Activity className="w-4 h-4" />
          Update Summaries
        </button>
        <button 
          onClick={() => window.open('/admin/analytics/customer-behavior', '_blank')}
          className="action-btn"
        >
          <Users className="w-4 h-4" />
          Customer Behavior
        </button>
        <button 
          onClick={() => window.open('/admin/analytics/inventory', '_blank')}
          className="action-btn"
        >
          <Package className="w-4 h-4" />
          Inventory Analytics
        </button>
        <button 
          onClick={() => window.open('/admin/analytics/cro', '_blank')}
          className="action-btn"
        >
          <TrendingUp className="w-4 h-4" />
          Conversion Insights
        </button>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage
