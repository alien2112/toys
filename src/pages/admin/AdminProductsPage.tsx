import React, { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  category_id: number
  category_name: string
  image_url: string
  stock: number
  is_featured: boolean
  is_active: boolean
  created_at: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  category_id: number
  is_active: boolean
  is_featured: boolean
  image_url: string
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: 1,
    is_active: true,
    is_featured: false,
    image_url: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    { id: 1, name: 'سيارات' },
    { id: 2, name: 'بالونات' },
    { id: 3, name: 'ديناصورات' },
    { id: 4, name: 'فضاء' }
  ]

  useEffect(() => {
    fetchProducts()
  }, [pagination.page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      const response = await fetch(`http://localhost:8000/api/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data || [])
        // Note: Backend might not return pagination, so we'll handle it gracefully
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } else {
        throw new Error(data.message || 'Failed to fetch products')
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err)
      setError(err.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      const url = editingProduct 
        ? `http://localhost:8000/api/products/${editingProduct.id}`
        : 'http://localhost:8000/api/products'
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowModal(false)
        setEditingProduct(null)
        setFormData({
          name: '',
          description: '',
          price: 0,
          stock: 0,
          category_id: 1,
          is_active: true,
          is_featured: false,
          image_url: ''
        })
        fetchProducts()
      } else {
        throw new Error(data.message || 'Failed to save product')
      }
    } catch (err: any) {
      console.error('Failed to save product:', err)
      alert(err.message || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== productId))
      } else {
        throw new Error(data.message || 'Failed to delete product')
      }
    } catch (err: any) {
      console.error('Failed to delete product:', err)
      alert(err.message || 'Failed to delete product')
    }
  }

  const handleToggleFeatured = async (productId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/products/${productId}/toggle-featured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, is_featured: !p.is_featured } : p
        ))
      } else {
        throw new Error(data.message || 'Failed to toggle featured status')
      }
    } catch (err: any) {
      console.error('Failed to toggle featured:', err)
      alert(err.message || 'Failed to toggle featured status')
    }
  }

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/upload/product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.data.url }))
      } else {
        throw new Error(data.message || 'Failed to upload image')
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      alert(err.message || 'Failed to upload image')
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      is_active: product.is_active,
      is_featured: product.is_featured,
      image_url: product.image_url
    })
    setShowModal(true)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.category_name === categoryFilter
    const matchesStock = !stockFilter || 
      (stockFilter === 'low' && product.stock < 10) ||
      (stockFilter === 'out' && product.stock === 0) ||
      (stockFilter === 'all')
    
    return matchesSearch && matchesCategory && matchesStock
  })

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-100'
    if (stock < 10) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Out of Stock'
    if (stock < 10) return 'Low'
    return 'In Stock'
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Stock</option>
              <option value="all">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'table' ? 'Grid View' : 'Table View'}
            </button>
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
                  onClick={fetchProducts}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredProducts.length > 0 ? (
          <>
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.price} SAR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockColor(product.stock)}`}>
                            {getStockText(product.stock)} ({product.stock})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleFeatured(product.id)}
                            className={`p-1 rounded-md ${product.is_featured ? 'text-yellow-500' : 'text-gray-400'} hover:bg-gray-100`}
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-gray-900">{product.price} SAR</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockColor(product.stock)}`}>
                        {getStockText(product.stock)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleToggleFeatured(product.id)}
                        className={`p-1 rounded-md ${product.is_featured ? 'text-yellow-500' : 'text-gray-400'} hover:bg-gray-100`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {formData.image_url && (
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="mt-2 h-20 w-20 object-cover rounded-md"
                        />
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
                      setFormData({
                        name: '',
                        description: '',
                        price: 0,
                        stock: 0,
                        category_id: 1,
                        is_active: true,
                        is_featured: false,
                        image_url: ''
                      })
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
