import React, { useEffect, useState } from 'react'

interface Order {
  id: number
  user_email: string
  user_name: string
  total_amount: number
  status: string
  shipping_address: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
  customer_name?: string
  customer_email?: string
}

interface OrderStatusHistory {
  id: number
  order_id: number
  old_status: string | null
  new_status: string
  changed_by: number | null
  admin_name: string | null
  notes: string | null
  created_at: string
}

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // New status system
  const validStatuses = ['pending', 'processed', 'shipping', 'delivered', 'cancelled']

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, pagination.page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`http://localhost:8000/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data.orders || [])
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch orders')
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err)
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string, notes?: string) => {
    setUpdatingOrderId(orderId)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, notes: notes || '' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update the order in local state with the returned data
        setOrders(prev => prev.map(order => 
          order.id === orderId ? data.data : order
        ))
        setShowStatusModal(false)
        setSelectedOrder(null)
        setStatusNotes('')
      } else {
        throw new Error(data.message || 'Failed to update order status')
      }
    } catch (err: any) {
      console.error('Failed to update order status:', err)
      alert(err.message || 'Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order)
    setSelectedStatus(order.status)
    setShowStatusModal(true)
  }

  const confirmStatusUpdate = () => {
    if (selectedOrder && selectedStatus !== selectedOrder.status) {
      updateOrderStatus(selectedOrder.id, selectedStatus, statusNotes)
    }
  }

  const fetchStatusHistory = async (orderId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatusHistory(data.data)
        setShowHistoryModal(true)
      } else {
        throw new Error(data.message || 'Failed to fetch status history')
      }
    } catch (err: any) {
      console.error('Failed to fetch status history:', err)
      alert(err.message || 'Failed to fetch status history')
    }
  }

  const handleViewHistory = (order: Order) => {
    setSelectedOrder(order)
    fetchStatusHistory(order.id)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processed': 'bg-blue-100 text-blue-800',
      'shipping': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const translations: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'processed': 'تمت المعالجة',
      'shipping': 'قيد الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي'
    }
    return translations[status] || status
  }

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and track all customer orders</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchOrders}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                          <div className="text-sm text-gray-500">{order.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total_amount} SAR
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {expandedOrder === order.id ? 'Hide' : 'View'} Details
                          </button>
                          <button
                            onClick={() => handleStatusClick(order)}
                            disabled={updatingOrderId === order.id}
                            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {updatingOrderId === order.id ? 'Updating...' : 'Update Status'}
                          </button>
                          <button
                            onClick={() => handleViewHistory(order)}
                            className="text-sm bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Order Details */}
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
                            </div>
                            
                            {order.items && order.items.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                      <div>
                                        <span className="font-medium">{item.product_name}</span>
                                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                      </div>
                                      <span className="text-gray-900">{item.price * item.quantity} SAR</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding some products to your store.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Update Order Status - #{selectedOrder.id}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {validStatuses.map(status => (
                    <option key={status} value={status}>
                      {getStatusText(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add notes about this status change..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedOrder(null)
                    setStatusNotes('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  disabled={selectedStatus === selectedOrder.status || updatingOrderId !== null}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updatingOrderId ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showHistoryModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Status History - Order #{selectedOrder.id}
              </h3>
              
              <div className="space-y-3">
                {statusHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No status changes recorded</p>
                ) : (
                  statusHistory.map((history) => (
                    <div key={history.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            {history.old_status && (
                              <>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(history.old_status)}`}>
                                  {getStatusText(history.old_status)}
                                </span>
                                <span className="text-gray-500">→</span>
                              </>
                            )}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(history.new_status)}`}>
                              {getStatusText(history.new_status)}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            By {history.admin_name || 'System'} • {new Date(history.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowHistoryModal(false)
                    setSelectedOrder(null)
                    setStatusHistory([])
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
