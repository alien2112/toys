import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Users, ShoppingCart, Smartphone, Monitor, Lightbulb, AlertTriangle, BarChart3, PieChart } from 'lucide-react'
import { apiService } from '../../services/api'
import './CROAnalyticsPage.css'

interface DailyFunnel {
  date: string
  visitors: number
  product_views: number
  add_to_carts: number
  checkout_started: number
  purchases: number
}

interface DevicePerformance {
  device_type: string
  visitors: number
  purchases: number
  conversion_rate: number
}

interface ProductConversion {
  id: number
  name: string
  views: number
  purchases: number
  conversion_rate: number
}

interface CROData {
  daily_funnel: DailyFunnel[]
  device_performance: DevicePerformance[]
  product_conversions: ProductConversion[]
  optimization_insights: string[]
  overall_metrics: {
    cart_abandonment_rate: number
  }
}

const CROAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<CROData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const fetchCROData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      })
      const response = await apiService.get<CROData>(`/admin/analytics/cro?${params}`)
      setData(response)
    } catch (err: any) {
      setError(err.message || 'Failed to load CRO data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCROData()
  }, [dateRange])

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-KW').format(num)
  }

  const calculateConversionRate = (step: number, total: number) => {
    return total > 0 ? (step / total) * 100 : 0
  }

  const getConversionColor = (rate: number) => {
    if (rate >= 3) return 'excellent'
    if (rate >= 2) return 'good'
    if (rate >= 1) return 'average'
    return 'poor'
  }

  if (loading) {
    return (
      <div className="cro-analytics-page">
        <div className="cro-header">
          <h1>Conversion Rate Optimization</h1>
          <div className="cro-loading">
            <div className="loading-spinner"></div>
            <span>Loading CRO data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cro-analytics-page">
        <div className="cro-header">
          <h1>Conversion Rate Optimization</h1>
          <div className="cro-error">
            <span>{error}</span>
            <button onClick={fetchCROData} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cro-analytics-page">
      {/* Header */}
      <div className="cro-header">
        <div className="header-left">
          <h1>Conversion Rate Optimization</h1>
          <p>Analyze conversion funnels and optimize customer journey</p>
        </div>
        <div className="header-actions">
          <div className="date-range-selector">
            <BarChart3 className="w-4 h-4" />
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

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Target className="w-5 h-5" />
            </div>
            <div className="metric-title">Overall Conversion Rate</div>
          </div>
          <div className="metric-value">
            {data && data.daily_funnel.length > 0 ? (
              formatPercentage(
                calculateConversionRate(
                  data.daily_funnel.reduce((sum, day) => sum + day.purchases, 0),
                  data.daily_funnel.reduce((sum, day) => sum + day.visitors, 0)
                )
              )
            ) : '0%'}
          </div>
          <div className="metric-description">
            Visitors to purchases ratio
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon warning">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="metric-title">Cart Abandonment Rate</div>
          </div>
          <div className="metric-value">
            {data ? formatPercentage(data.overall_metrics.cart_abandonment_rate) : '0%'}
          </div>
          <div className="metric-description">
            {data && data.overall_metrics.cart_abandonment_rate > 70 ? (
              <span className="warning-text">High abandonment detected</span>
            ) : (
              <span className="good-text">Within acceptable range</span>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Users className="w-5 h-5" />
            </div>
            <div className="metric-title">Product View Rate</div>
          </div>
          <div className="metric-value">
            {data && data.daily_funnel.length > 0 ? (
              formatPercentage(
                calculateConversionRate(
                  data.daily_funnel.reduce((sum, day) => sum + day.product_views, 0),
                  data.daily_funnel.reduce((sum, day) => sum + day.visitors, 0)
                )
              )
            ) : '0%'}
          </div>
          <div className="metric-description">
            Visitors who view products
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="metric-title">Checkout Rate</div>
          </div>
          <div className="metric-value">
            {data && data.daily_funnel.length > 0 ? (
              formatPercentage(
                calculateConversionRate(
                  data.daily_funnel.reduce((sum, day) => sum + day.checkout_started, 0),
                  data.daily_funnel.reduce((sum, day) => sum + day.visitors, 0)
                )
              )
            ) : '0%'}
          </div>
          <div className="metric-description">
            Visitors who start checkout
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="funnel-section">
        <div className="section-header">
          <h2>
            <Target className="w-5 h-5" />
            Conversion Funnel Analysis
          </h2>
          <p>Detailed breakdown of customer journey stages</p>
        </div>

        <div className="funnel-visualization">
          {data && data.daily_funnel.length > 0 && (
            <div className="funnel-steps">
              {[
                { 
                  label: 'Visitors', 
                  value: data.daily_funnel.reduce((sum, day) => sum + day.visitors, 0),
                  icon: <Users className="w-4 h-4" />,
                  color: '#3b82f6'
                },
                { 
                  label: 'Product Views', 
                  value: data.daily_funnel.reduce((sum, day) => sum + day.product_views, 0),
                  icon: <Target className="w-4 h-4" />,
                  color: '#8b5cf6'
                },
                { 
                  label: 'Add to Cart', 
                  value: data.daily_funnel.reduce((sum, day) => sum + day.add_to_carts, 0),
                  icon: <ShoppingCart className="w-4 h-4" />,
                  color: '#f59e0b'
                },
                { 
                  label: 'Checkout Started', 
                  value: data.daily_funnel.reduce((sum, day) => sum + day.checkout_started, 0),
                  icon: <TrendingUp className="w-4 h-4" />,
                  color: '#ef4444'
                },
                { 
                  label: 'Purchases', 
                  value: data.daily_funnel.reduce((sum, day) => sum + day.purchases, 0),
                  icon: <Target className="w-4 h-4" />,
                  color: '#10b981'
                }
              ].map((step, index) => {
                const maxValue = data.daily_funnel.reduce((sum, day) => sum + day.visitors, 0)
                const percentage = (step.value / maxValue) * 100
                const prevValue = index > 0 ? 
                  data.daily_funnel.reduce((sum, day) => sum + day.visitors, 0) : 
                  step.value
                
                return (
                  <div key={index} className="funnel-step">
                    <div className="step-bar">
                      <div 
                        className="step-fill"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: step.color
                        }}
                      />
                    </div>
                    <div className="step-info">
                      <div className="step-header">
                        <div className="step-icon" style={{ color: step.color }}>
                          {step.icon}
                        </div>
                        <span className="step-label">{step.label}</span>
                      </div>
                      <div className="step-metrics">
                        <div className="step-value">{formatNumber(step.value)}</div>
                        <div className="step-percentage">{formatPercentage(percentage)}</div>
                      </div>
                      {index > 0 && (
                        <div className="step-dropoff">
                          <TrendingDown className="w-3 h-3" />
                          <span>
                            {formatPercentage(100 - (step.value / prevValue) * 100)} dropoff
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Device Performance */}
      <div className="device-section">
        <div className="section-header">
          <h2>
            <Monitor className="w-5 h-5" />
            Device Performance Analysis
          </h2>
          <p>Conversion rates by device type</p>
        </div>

        <div className="device-grid">
          {data?.device_performance && data.device_performance.length > 0 ? (
            data.device_performance.map((device, index) => (
              <div key={index} className="device-card">
                <div className="device-icon">
                  {device.device_type === 'Mobile' ? (
                    <Smartphone className="w-6 h-6" />
                  ) : device.device_type === 'Tablet' ? (
                    <Monitor className="w-6 h-6" />
                  ) : (
                    <Monitor className="w-6 h-6" />
                  )}
                </div>
                <div className="device-info">
                  <h3>{device.device_type}</h3>
                  <div className="device-metrics">
                    <div className="metric">
                      <span className="label">Visitors</span>
                      <span className="value">{formatNumber(device.visitors)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Purchases</span>
                      <span className="value">{formatNumber(device.purchases)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Conversion</span>
                      <span className={`value conversion-${getConversionColor(device.conversion_rate)}`}>
                        {formatPercentage(device.conversion_rate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No device data available</div>
          )}
        </div>
      </div>

      {/* Product Conversion Analysis */}
      <div className="products-section">
        <div className="section-header">
          <h2>
            <PieChart className="w-5 h-5" />
            Product Conversion Analysis
          </h2>
          <p>Products with high views but low conversions</p>
        </div>

        <div className="products-table">
          {data?.product_conversions && data.product_conversions.length > 0 ? (
            <table className="conversion-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Views</th>
                  <th>Purchases</th>
                  <th>Conversion Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.product_conversions.map((product, index) => (
                  <tr key={index}>
                    <td className="product-name">{product.name}</td>
                    <td>{formatNumber(product.views)}</td>
                    <td>{formatNumber(product.purchases)}</td>
                    <td className={`conversion-rate conversion-${getConversionColor(product.conversion_rate)}`}>
                      {formatPercentage(product.conversion_rate)}
                    </td>
                    <td>
                      <span className={`status-badge ${getConversionColor(product.conversion_rate)}`}>
                        {product.conversion_rate >= 3 ? 'Excellent' :
                         product.conversion_rate >= 2 ? 'Good' :
                         product.conversion_rate >= 1 ? 'Average' : 'Poor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">No product conversion data available</div>
          )}
        </div>
      </div>

      {/* Optimization Insights */}
      <div className="insights-section">
        <div className="section-header">
          <h2>
            <Lightbulb className="w-5 h-5" />
            Optimization Insights
          </h2>
          <p>AI-powered recommendations to improve conversion rates</p>
        </div>

        <div className="insights-grid">
          {data?.optimization_insights && data.optimization_insights.length > 0 ? (
            data.optimization_insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-icon">
                  {insight.includes('high') || insight.includes('low') ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Lightbulb className="w-5 h-5" />
                  )}
                </div>
                <div className="insight-content">
                  <p>{insight}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No insights available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CROAnalyticsPage
