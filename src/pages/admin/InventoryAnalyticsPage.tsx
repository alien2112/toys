import React, { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingDown, TrendingUp, RefreshCw, Download, AlertCircle, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import { apiService } from '../../services/api'
import './InventoryAnalyticsPage.css'

interface LowStockProduct {
  id: number
  name: string
  stock: number
  category: string
  total_sold: number
}

interface OutOfStockProduct {
  id: number
  name: string
  category: string
  total_sold: number
}

interface TurnoverProduct {
  id: number
  name: string
  stock: number
  sold_last_30_days: number
  days_of_supply: number
}

interface DeadStockProduct {
  id: number
  name: string
  stock: number
  price: number
  category: string
}

interface InventoryData {
  low_stock: LowStockProduct[]
  out_of_stock: OutOfStockProduct[]
  turnover_analysis: TurnoverProduct[]
  dead_stock: DeadStockProduct[]
  inventory_health_score: number
  summary: {
    total_products: number
    low_stock_count: number
    out_of_stock_count: number
    dead_stock_count: number
  }
}

const InventoryAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'low-stock' | 'out-of-stock' | 'turnover' | 'dead-stock'>('overview')

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<InventoryData>('/admin/analytics/inventory')
      setData(response)
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const handleExport = async () => {
    try {
      window.open('/api/admin/analytics/export?type=inventory', '_blank')
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

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'warning'
    return 'critical'
  }

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5" />
    if (score >= 60) return <CheckCircle className="w-5 h-5" />
    if (score >= 40) return <AlertCircle className="w-5 h-5" />
    return <AlertTriangle className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="inventory-analytics-page">
        <div className="inventory-header">
          <h1>Inventory Analytics</h1>
          <div className="inventory-loading">
            <div className="loading-spinner"></div>
            <span>Loading inventory data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="inventory-analytics-page">
        <div className="inventory-header">
          <h1>Inventory Analytics</h1>
          <div className="inventory-error">
            <span>{error}</span>
            <button onClick={fetchInventoryData} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="inventory-analytics-page">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-left">
          <h1>Inventory Analytics</h1>
          <p>Monitor stock levels, turnover rates, and inventory health</p>
        </div>
        <div className="header-actions">
          <button onClick={handleExport} className="export-btn">
            <Download className="w-4 h-4" />
            Export Inventory
          </button>
          <button onClick={fetchInventoryData} className="refresh-btn">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Health Score Card */}
      <div className={`health-score-card health-${getHealthScoreColor(data?.inventory_health_score || 0)}`}>
        <div className="health-score-content">
          <div className="health-score-header">
            <div className="health-score-icon">
              {data && getHealthScoreIcon(data.inventory_health_score)}
            </div>
            <div className="health-score-title">
              <h2>Inventory Health Score</h2>
              <p>Overall inventory performance indicator</p>
            </div>
          </div>
          <div className="health-score-value">
            <span className="score-number">{data?.inventory_health_score || 0}%</span>
            <span className="score-label">
              {data && data.inventory_health_score >= 80 ? 'Excellent' :
               data && data.inventory_health_score >= 60 ? 'Good' :
               data && data.inventory_health_score >= 40 ? 'Needs Attention' : 'Critical'}
            </span>
          </div>
        </div>
        <div className="health-score-gauge">
          <div 
            className="gauge-fill"
            style={{ width: `${data?.inventory_health_score || 0}%` }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">
            <Package className="w-5 h-5" />
          </div>
          <div className="summary-content">
            <div className="summary-value">{formatNumber(data?.summary.total_products || 0)}</div>
            <div className="summary-label">Total Products</div>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="summary-icon">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="summary-content">
            <div className="summary-value">{formatNumber(data?.summary.low_stock_count || 0)}</div>
            <div className="summary-label">Low Stock</div>
          </div>
        </div>

        <div className="summary-card critical">
          <div className="summary-icon">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="summary-content">
            <div className="summary-value">{formatNumber(data?.summary.out_of_stock_count || 0)}</div>
            <div className="summary-label">Out of Stock</div>
          </div>
        </div>

        <div className="summary-card info">
          <div className="summary-icon">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="summary-content">
            <div className="summary-value">{formatNumber(data?.summary.dead_stock_count || 0)}</div>
            <div className="summary-label">Dead Stock</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inventory-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="w-4 h-4" />
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'low-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('low-stock')}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock ({data?.summary.low_stock_count || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'out-of-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('out-of-stock')}
        >
          <AlertCircle className="w-4 h-4" />
          Out of Stock ({data?.summary.out_of_stock_count || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'turnover' ? 'active' : ''}`}
          onClick={() => setActiveTab('turnover')}
        >
          <TrendingUp className="w-4 h-4" />
          Turnover Analysis
        </button>
        <button
          className={`tab-button ${activeTab === 'dead-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('dead-stock')}
        >
          <TrendingDown className="w-4 h-4" />
          Dead Stock ({data?.summary.dead_stock_count || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Low Stock Alerts</h3>
                <p>Products that need immediate restocking</p>
                {data?.low_stock && data.low_stock.length > 0 ? (
                  <div className="mini-list">
                    {data.low_stock.slice(0, 5).map((product, index) => (
                      <div key={index} className="mini-item">
                        <span className="item-name">{product.name}</span>
                        <span className="item-stock">{product.stock} units</span>
                      </div>
                    ))}
                    {data.low_stock.length > 5 && (
                      <div className="more-items">+{data.low_stock.length - 5} more</div>
                    )}
                  </div>
                ) : (
                  <div className="no-data">No low stock items</div>
                )}
              </div>

              <div className="overview-card">
                <h3>Out of Stock</h3>
                <p>Products that are completely sold out</p>
                {data?.out_of_stock && data.out_of_stock.length > 0 ? (
                  <div className="mini-list">
                    {data.out_of_stock.slice(0, 5).map((product, index) => (
                      <div key={index} className="mini-item">
                        <span className="item-name">{product.name}</span>
                        <span className="item-sold">{product.total_sold} sold</span>
                      </div>
                    ))}
                    {data.out_of_stock.length > 5 && (
                      <div className="more-items">+{data.out_of_stock.length - 5} more</div>
                    )}
                  </div>
                ) : (
                  <div className="no-data">No out of stock items</div>
                )}
              </div>

              <div className="overview-card">
                <h3>Critical Turnover</h3>
                <p>Products with less than 30 days of supply</p>
                {data?.turnover_analysis && data.turnover_analysis.length > 0 ? (
                  <div className="mini-list">
                    {data.turnover_analysis
                      .filter(p => p.days_of_supply <= 30)
                      .slice(0, 5)
                      .map((product, index) => (
                        <div key={index} className="mini-item">
                          <span className="item-name">{product.name}</span>
                          <span className="item-days">{product.days_of_supply} days</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="no-data">No critical turnover items</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'low-stock' && (
          <div className="table-content">
            <h3>Low Stock Products</h3>
            {data?.low_stock && data.low_stock.length > 0 ? (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Total Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.low_stock.map((product, index) => (
                    <tr key={index}>
                      <td className="product-name">{product.name}</td>
                      <td>{product.category}</td>
                      <td className="stock-warning">{formatNumber(product.stock)}</td>
                      <td>{formatNumber(product.total_sold)}</td>
                      <td>
                        <span className="status-badge warning">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No low stock products</div>
            )}
          </div>
        )}

        {activeTab === 'out-of-stock' && (
          <div className="table-content">
            <h3>Out of Stock Products</h3>
            {data?.out_of_stock && data.out_of_stock.length > 0 ? (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Total Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.out_of_stock.map((product, index) => (
                    <tr key={index}>
                      <td className="product-name">{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatNumber(product.total_sold)}</td>
                      <td>
                        <span className="status-badge critical">
                          <AlertCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No out of stock products</div>
            )}
          </div>
        )}

        {activeTab === 'turnover' && (
          <div className="table-content">
            <h3>Inventory Turnover Analysis</h3>
            {data?.turnover_analysis && data.turnover_analysis.length > 0 ? (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Sold (30 days)</th>
                    <th>Days of Supply</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.turnover_analysis.map((product, index) => (
                    <tr key={index}>
                      <td className="product-name">{product.name}</td>
                      <td>{formatNumber(product.stock)}</td>
                      <td>{formatNumber(product.sold_last_30_days)}</td>
                      <td className={`days-supply ${
                        product.days_of_supply <= 30 ? 'critical' :
                        product.days_of_supply <= 60 ? 'warning' : 'good'
                      }`}>
                        {product.days_of_supply === 999 ? 'N/A' : formatNumber(product.days_of_supply)}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          product.days_of_supply <= 30 ? 'critical' :
                          product.days_of_supply <= 60 ? 'warning' : 'good'
                        }`}>
                          {product.days_of_supply <= 30 ? <Clock className="w-3 h-3" /> :
                           product.days_of_supply <= 60 ? <AlertTriangle className="w-3 h-3" /> :
                           <CheckCircle className="w-3 h-3" />}
                          {product.days_of_supply <= 30 ? 'Critical' :
                           product.days_of_supply <= 60 ? 'Low Supply' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No turnover data available</div>
            )}
          </div>
        )}

        {activeTab === 'dead-stock' && (
          <div className="table-content">
            <h3>Dead Stock (No sales in 90 days)</h3>
            {data?.dead_stock && data.dead_stock.length > 0 ? (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dead_stock.map((product, index) => (
                    <tr key={index}>
                      <td className="product-name">{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatNumber(product.stock)}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{formatCurrency(product.stock * product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No dead stock items</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryAnalyticsPage
