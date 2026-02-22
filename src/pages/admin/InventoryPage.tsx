import React, { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingUp, RefreshCw, Search, Filter } from 'lucide-react'
import { apiService } from '../../services/api'
import './InventoryPage.css'

interface LowStockItem {
  id: number
  name: string
  stock: number
  alert_threshold: number
  price: number
  image_url: string
}

interface InventoryMovement {
  id: number
  movement_type: string
  quantity: number
  reference_type: string
  reason: string
  created_at: string
  first_name: string
  last_name: string
}

const InventoryPage: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [batchUpdates, setBatchUpdates] = useState<{product_id: number, stock: number, reason: string}[]>([])
  const [showBatchUpdate, setShowBatchUpdate] = useState(false)

  useEffect(() => {
    loadLowStockItems()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      loadMovements(selectedProduct)
    }
  }, [selectedProduct])

  const loadLowStockItems = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/admin/inventory/low-stock?threshold=10')
      setLowStockItems(response || [])
    } catch (err) {
      console.error('Error loading low stock items:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMovements = async (productId: number) => {
    try {
      const response = await apiService.get(`/admin/inventory/movements/${productId}`)
      setMovements(response || [])
    } catch (err) {
      console.error('Error loading movements:', err)
    }
  }

  const handleBatchUpdate = async () => {
    if (batchUpdates.length === 0) return

    try {
      await apiService.put('/admin/inventory/batch-update', { updates: batchUpdates })
      setShowBatchUpdate(false)
      setBatchUpdates([])
      loadLowStockItems()
    } catch (err) {
      console.error('Error updating inventory:', err)
    }
  }

  const addToBatchUpdate = (productId: number, currentStock: number) => {
    const existing = batchUpdates.find(u => u.product_id === productId)
    if (existing) {
      setBatchUpdates(batchUpdates.map(u => 
        u.product_id === productId 
          ? { ...u, stock: currentStock }
          : u
      ))
    } else {
      setBatchUpdates([...batchUpdates, {
        product_id: productId,
        stock: currentStock,
        reason: 'Manual stock update'
      }])
    }
  }

  const filteredItems = lowStockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <div className="header-actions">
          <button 
            className="batch-update-button"
            onClick={() => setShowBatchUpdate(true)}
          >
            <RefreshCw size={20} />
            Batch Update
          </button>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="stat-card">
          <Package className="stat-icon" />
          <div>
            <h3>{lowStockItems.length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card">
          <AlertTriangle className="stat-icon alert" />
          <div>
            <h3>{lowStockItems.filter(item => item.stock === 0).length}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div>
            <h3>{movements.length}</h3>
            <p>Recent Movements</p>
          </div>
        </div>
      </div>

      <div className="inventory-content">
        <div className="low-stock-section">
          <div className="section-header">
            <h2>Low Stock Alerts</h2>
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="low-stock-grid">
              {filteredItems.map(item => (
                <div key={item.id} className="stock-card">
                  <div className="stock-image">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="stock-info">
                    <h3>{item.name}</h3>
                    <p className="price">{item.price.toFixed(2)} ر.س</p>
                    <div className="stock-level">
                      <span className={`stock-count ${item.stock === 0 ? 'out' : 'low'}`}>
                        {item.stock} units
                      </span>
                      <span className="threshold">Alert at: {item.alert_threshold}</span>
                    </div>
                  </div>
                  <div className="stock-actions">
                    <button 
                      className="view-movements-button"
                      onClick={() => setSelectedProduct(item.id)}
                    >
                      View Movements
                    </button>
                    <input
                      type="number"
                      className="stock-input"
                      placeholder="New stock"
                      onChange={(e) => addToBatchUpdate(item.id, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProduct && (
          <div className="movements-section">
            <div className="section-header">
              <h2>Inventory Movements</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>
            </div>
            <div className="movements-list">
              {movements.map(movement => (
                <div key={movement.id} className="movement-item">
                  <div className="movement-type">
                    <span className={`type-badge ${movement.movement_type}`}>
                      {movement.movement_type.toUpperCase()}
                    </span>
                    <span className="quantity">{movement.quantity} units</span>
                  </div>
                  <div className="movement-details">
                    <p className="reason">{movement.reason}</p>
                    <p className="reference">{movement.reference_type}</p>
                    <p className="user">
                      {movement.first_name} {movement.last_name}
                    </p>
                  </div>
                  <div className="movement-time">
                    {new Date(movement.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showBatchUpdate && (
        <div className="batch-update-modal">
          <div className="modal-content">
            <h3>Batch Inventory Update</h3>
            <div className="batch-list">
              {batchUpdates.map((update, index) => (
                <div key={index} className="batch-item">
                  <span>Product ID: {update.product_id}</span>
                  <input
                    type="number"
                    value={update.stock}
                    onChange={(e) => setBatchUpdates(batchUpdates.map((u, i) =>
                      i === index ? { ...u, stock: parseInt(e.target.value) || 0 } : u
                    ))}
                  />
                  <input
                    type="text"
                    value={update.reason}
                    onChange={(e) => setBatchUpdates(batchUpdates.map((u, i) =>
                      i === index ? { ...u, reason: e.target.value } : u
                    ))}
                    placeholder="Reason"
                  />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowBatchUpdate(false)}>Cancel</button>
              <button onClick={handleBatchUpdate} className="primary">
                Update {batchUpdates.length} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
