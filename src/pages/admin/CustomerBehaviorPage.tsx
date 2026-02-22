import React, { useState, useEffect } from 'react'
import { Users, Eye, ShoppingCart, CreditCard, TrendingUp, TrendingDown, Target, Activity, MousePointer, Clock } from 'lucide-react'
import { apiService } from '../../services/api'
import './CustomerBehaviorPage.css'

interface FunnelData {
  visitors: number
  product_views: number
  add_to_carts: number
  checkout_started: number
  purchases: number
  product_view_rate: number
  cart_rate: number
  checkout_rate: number
  purchase_rate: number
}

interface ViewedProduct {
  name: string
  id: number
  views: number
}

interface CustomerLifetimeValue {
  avg_clv: number
  max_clv: number
  min_clv: number
}

interface BehaviorData {
  funnel: FunnelData
  most_viewed_products: ViewedProduct[]
  cart_abandonment_rate: number
  customer_lifetime_value: CustomerLifetimeValue
}

const CustomerBehaviorPage: React.FC = () => {
  const [data, setData] = useState<BehaviorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const fetchBehaviorData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      })
      const response = await apiService.get<BehaviorData>(`/admin/analytics/customer-behavior?${params}`)
      setData(response)
    } catch (err: any) {
      setError(err.message || 'Failed to load customer behavior data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBehaviorData()
  }, [dateRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-KW').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="customer-behavior-page">
        <div className="behavior-header">
          <h1>Customer Behavior Analytics</h1>
          <div className="behavior-loading">
            <div className="loading-spinner"></div>
            <span>Loading behavior data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="customer-behavior-page">
        <div className="behavior-header">
          <h1>Customer Behavior Analytics</h1>
          <div className="behavior-error">
            <span>{error}</span>
            <button onClick={fetchBehaviorData} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-behavior-page">
      {/* Header */}
      <div className="behavior-header">
        <div className="header-left">
          <h1>Customer Behavior Analytics</h1>
          <p>Understand how customers interact with your store</p>
        </div>
        <div className="header-actions">
          <div className="date-range-selector">
            <Clock className="w-4 h-4" />
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
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="funnel-section">
        <div className="section-header">
          <h2>
            <Target className="w-5 h-5" />
            Conversion Funnel
          </h2>
          <p>Track customer journey from visit to purchase</p>
        </div>
        
        <div className="funnel-container">
          {data?.funnel && (
            <div className="funnel-steps">
              <div className="funnel-step">
                <div className="step-header">
                  <Eye className="w-5 h-5" />
                  <span>Visitors</span>
                </div>
                <div className="step-metrics">
                  <div className="step-value">{formatNumber(data.funnel.visitors)}</div>
                  <div className="step-description">Total visitors</div>
                </div>
              </div>

              <div className="funnel-arrow">
                <TrendingDown className="w-4 h-4" />
                <span>{formatPercentage(data.funnel.product_view_rate)}</span>
              </div>

              <div className="funnel-step">
                <div className="step-header">
                  <MousePointer className="w-5 h-5" />
                  <span>Product Views</span>
                </div>
                <div className="step-metrics">
                  <div className="step-value">{formatNumber(data.funnel.product_views)}</div>
                  <div className="step-description">Products viewed</div>
                </div>
              </div>

              <div className="funnel-arrow">
                <TrendingDown className="w-4 h-4" />
                <span>{formatPercentage(data.funnel.cart_rate)}</span>
              </div>

              <div className="funnel-step">
                <div className="step-header">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </div>
                <div className="step-metrics">
                  <div className="step-value">{formatNumber(data.funnel.add_to_carts)}</div>
                  <div className="step-description">Items added</div>
                </div>
              </div>

              <div className="funnel-arrow">
                <TrendingDown className="w-4 h-4" />
                <span>{formatPercentage(data.funnel.checkout_rate)}</span>
              </div>

              <div className="funnel-step">
                <div className="step-header">
                  <CreditCard className="w-5 h-5" />
                  <span>Checkout</span>
                </div>
                <div className="step-metrics">
                  <div className="step-value">{formatNumber(data.funnel.checkout_started)}</div>
                  <div className="step-description">Checkout started</div>
                </div>
              </div>

              <div className="funnel-arrow">
                <TrendingDown className="w-4 h-4" />
                <span>{formatPercentage(data.funnel.purchase_rate)}</span>
              </div>

              <div className="funnel-step">
                <div className="step-header">
                  <Activity className="w-5 h-5" />
                  <span>Purchases</span>
                </div>
                <div className="step-metrics">
                  <div className="step-value">{formatNumber(data.funnel.purchases)}</div>
                  <div className="step-description">Completed purchases</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Cart Abandonment */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon warning">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="metric-title">Cart Abandonment Rate</div>
          </div>
          <div className="metric-value">
            {data ? formatPercentage(data.cart_abandonment_rate) : '0%'}
          </div>
          <div className="metric-description">
            {data && data.cart_abandonment_rate > 70 ? (
              <span className="warning-indicator">High abandonment - consider checkout optimization</span>
            ) : (
              <span className="good-indicator">Within acceptable range</span>
            )}
          </div>
        </div>

        {/* Customer Lifetime Value */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon success">
              <Users className="w-5 h-5" />
            </div>
            <div className="metric-title">Average Customer Lifetime Value</div>
          </div>
          <div className="metric-value">
            {data ? formatCurrency(data.customer_lifetime_value.avg_clv) : 'KWD 0'}
          </div>
          <div className="metric-description">
            {data && (
              <span>
                Range: {formatCurrency(data.customer_lifetime_value.min_clv)} - {formatCurrency(data.customer_lifetime_value.max_clv)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Most Viewed Products */}
      <div className="products-section">
        <div className="section-header">
          <h2>
            <Eye className="w-5 h-5" />
            Most Viewed Products
          </h2>
          <p>Products that attract the most customer attention</p>
        </div>

        <div className="products-grid">
          {data?.most_viewed_products && data.most_viewed_products.length > 0 ? (
            data.most_viewed_products.map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-views">{formatNumber(product.views)} views</div>
                </div>
                <div className="product-icon">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No product view data available</div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <div className="section-header">
          <h2>
            <Activity className="w-5 h-5" />
            Behavioral Insights
          </h2>
          <p>Key takeaways from customer behavior analysis</p>
        </div>

        <div className="insights-grid">
          {data && (
            <>
              {/* Conversion Rate Insight */}
              <div className="insight-card">
                <div className="insight-icon">
                  {data.funnel.purchase_rate < 2 ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                </div>
                <div className="insight-content">
                  <h4>Conversion Performance</h4>
                  <p>
                    Overall conversion rate is {formatPercentage(data.funnel.purchase_rate)}. 
                    {data.funnel.purchase_rate < 2 && ' Consider optimizing product pages and checkout process.'}
                    {data.funnel.purchase_rate >= 2 && ' Performance is within industry standards.'}
                  </p>
                </div>
              </div>

              {/* Cart Abandonment Insight */}
              <div className="insight-card">
                <div className="insight-icon">
                  {data.cart_abandonment_rate > 70 ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                </div>
                <div className="insight-content">
                  <h4>Cart Abandonment</h4>
                  <p>
                    {data.cart_abandonment_rate}% of carts are abandoned.
                    {data.cart_abandonment_rate > 70 && ' High abandonment suggests checkout friction or unexpected costs.'}
                    {data.cart_abandonment_rate <= 70 && ' Abandonment rate is reasonable for e-commerce.'}
                  </p>
                </div>
              </div>

              {/* Product Engagement Insight */}
              <div className="insight-card">
                <div className="insight-icon">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="insight-content">
                  <h4>Product Engagement</h4>
                  <p>
                    {data.most_viewed_products.length > 0 ? 
                      `Top product "${data.most_viewed_products[0].name}" received ${formatNumber(data.most_viewed_products[0].views)} views.` :
                      'No product engagement data available.'
                    }
                  </p>
                </div>
              </div>

              {/* Customer Value Insight */}
              <div className="insight-card">
                <div className="insight-icon">
                  <Users className="w-5 h-5" />
                </div>
                <div className="insight-content">
                  <h4>Customer Value</h4>
                  <p>
                    Average customer lifetime value is {formatCurrency(data.customer_lifetime_value.avg_clv)}.
                    {data.customer_lifetime_value.avg_clv < 50 && ' Focus on increasing repeat purchases and upselling.'}
                    {data.customer_lifetime_value.avg_clv >= 50 && ' Good customer value indicates strong retention.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerBehaviorPage
