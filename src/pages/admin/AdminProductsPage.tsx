import React, { useEffect, useState } from 'react'
import { Search, Plus, Edit2, Trash2, Star, Grid, List, Package, AlertTriangle, X, Upload, Eye, EyeOff, Layers } from 'lucide-react'
import { arabicTranslations } from '../../data/arabicTranslations'

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
  has_variants: boolean
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
  has_variants: boolean
}

interface VariantType {
  id: number
  name: string
  slug: string
  options_count: number
}

interface VariantOption {
  id: number
  variant_type_id: number
  value: string
  slug: string
  type_name: string
}

interface ProductVariant {
  id: number
  product_id: number
  sku: string
  price: number
  stock: number
  image_url: string
  is_active: boolean
  variant_options: VariantOption[]
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
    image_url: '',
    has_variants: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [variantFormData, setVariantFormData] = useState({
    sku: '',
    price: 0,
    stock: 0,
    image_url: '',
    is_active: true,
    variant_options: [] as number[]
  })

  const categories = [
    { id: 1, name: 'سيارات' },
    { id: 2, name: 'بالونات' },
    { id: 3, name: 'ديناصورات' },
    { id: 4, name: 'فضاء' }
  ]

  useEffect(() => {
    fetchProducts()
    fetchVariantTypes()
  }, [pagination.page])

  const fetchVariantTypes = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/admin/variant-types', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setVariantTypes(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch variant types:', err)
    }
  }

  const fetchVariants = async (productId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/products/${productId}/variants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setVariants(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch variants:', err)
    }
  }

  const fetchVariantOptions = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const options: VariantOption[] = []
      
      // Fetch options for each variant type
      for (const type of variantTypes) {
        const response = await fetch(`http://localhost:8000/api/admin/variant-types/${type.id}/options`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.json()
        if (data.success) {
          options.push(...(data.data || []))
        }
      }
      
      setVariantOptions(options)
    } catch (err) {
      console.error('Failed to fetch variant options:', err)
    }
  }

  const openVariantModal = (product: Product) => {
    setSelectedProduct(product)
    setEditingVariant(null)
    setVariantFormData({
      sku: '',
      price: product.price,
      stock: 0,
      image_url: product.image_url,
      is_active: true,
      variant_options: []
    })
    fetchVariants(product.id)
    fetchVariantOptions()
    setShowVariantModal(true)
  }

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setSubmitting(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      const url = editingVariant 
        ? `http://localhost:8000/api/variants/${editingVariant.id}`
        : `http://localhost:8000/api/products/${selectedProduct.id}/variants`
      
      const response = await fetch(url, {
        method: editingVariant ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variantFormData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowVariantModal(false)
        setEditingVariant(null)
        fetchVariants(selectedProduct.id)
        fetchProducts() // Refresh to update has_variants flag
      } else {
        throw new Error(data.message || 'Failed to save variant')
      }
    } catch (err: any) {
      console.error('Failed to save variant:', err)
      alert(err.message || 'Failed to save variant')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتغير؟')) {
      return
    }
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/variants/${variantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success && selectedProduct) {
        fetchVariants(selectedProduct.id)
        fetchProducts() // Refresh to update has_variants flag
      } else {
        throw new Error(data.message || 'Failed to delete variant')
      }
    } catch (err: any) {
      console.error('Failed to delete variant:', err)
      alert(err.message || 'Failed to delete variant')
    }
  }

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
          image_url: '',
          has_variants: false
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
    if (!confirm(`هل أنت متأكد من حذف "${productName}"؟`)) {
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
      image_url: product.image_url,
      has_variants: product.has_variants
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
    if (stock === 0) return arabicTranslations.outOfStock
    if (stock < 10) return arabicTranslations.lowStock
    return arabicTranslations.inStock
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المنتجات</h1>
          <p className="text-sm text-gray-500">إدارة كتالوج المنتجات الخاصة بك</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {arabicTranslations.addProduct}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={arabicTranslations.search + "..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full pr-3 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="block w-full pr-3 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">كل المخزون</option>
              <option value="all">{arabicTranslations.inStock}</option>
              <option value="low">{arabicTranslations.lowStock}</option>
              <option value="out">{arabicTranslations.outOfStock}</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              {viewMode === 'table' ? 'عرض شبكي' : 'عرض جدول'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
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
                onClick={fetchProducts}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredProducts.length > 0 ? (
          <>
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        الصورة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {arabicTranslations.productName}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {arabicTranslations.category}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {arabicTranslations.price}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {arabicTranslations.stock}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        مميز
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {arabicTranslations.active}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        المتغيرات
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {arabicTranslations.view}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 0.05}s` }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded-lg shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {product.category_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {product.price} {arabicTranslations.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStockColor(product.stock)}`}>
                            {getStockText(product.stock)} ({product.stock})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleFeatured(product.id)}
                            className={`p-2 rounded-lg transition-all ${product.is_featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 bg-gray-50'} hover:bg-yellow-100`}
                          >
                            <Star className="h-5 w-5" fill={product.is_featured ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {product.is_active ? arabicTranslations.active : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openVariantModal(product)}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                              product.has_variants 
                                ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            <Layers className="h-3 w-3" />
                            {product.has_variants ? 'متغيرات' : 'إضافة متغيرات'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-all"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
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
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative mb-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {product.is_featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                          <Star className="h-4 w-4" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{product.category_name}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-900">{product.price} {arabicTranslations.currency}</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStockColor(product.stock)}`}>
                        {getStockText(product.stock)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_active ? arabicTranslations.active : 'غير نشط'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{arabicTranslations.noProductsFound}</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة منتج جديد.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              {arabicTranslations.addProduct}
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">
                      {editingProduct ? arabicTranslations.editProduct : arabicTranslations.addProduct}
                    </h3>
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
                          image_url: '',
                          has_variants: false
                        })
                      }}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {arabicTranslations.productName}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="block w-full pr-3 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={arabicTranslations.productNamePlaceholder}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {arabicTranslations.description}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="block w-full pr-3 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={arabicTranslations.descriptionPlaceholder}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {arabicTranslations.price}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="block w-full pr-3 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={arabicTranslations.pricePlaceholder}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {arabicTranslations.stock}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        className="block w-full pr-3 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={arabicTranslations.stockPlaceholder}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {arabicTranslations.category}
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                        className="block w-full pr-3 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الصورة
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file)
                          }}
                          className="block w-full pr-3 pl-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <Upload className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      </div>
                      {formData.image_url && (
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="mt-3 h-24 w-24 object-cover rounded-lg shadow-sm"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-6 mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{arabicTranslations.active}</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{arabicTranslations.featured}</span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-base font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto disabled:opacity-50 transition-all"
                  >
                    {submitting ? arabicTranslations.saving : (editingProduct ? 'تحديث' : arababicTranslations.save)}
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
                        image_url: '',
                        has_variants: false
                      })
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto transition-all"
                  >
                    {arabicTranslations.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Variant Management Modal */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      إدارة متغيرات المنتج: {selectedProduct.name}
                    </h3>
                    <p className="text-purple-100 text-sm mt-1">
                      {selectedProduct.has_variants ? 'تعديل المتغيرات الموجودة' : 'إضافة متغيرات جديدة'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVariantModal(false)
                      setSelectedProduct(null)
                      setEditingVariant(null)
                      setVariants([])
                    }}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white px-6 py-6">
                {/* Existing Variants */}
                {variants.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">المتغيرات الحالية</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخصائص</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">نشط</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {variants.map((variant) => (
                            <tr key={variant.id}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{variant.sku}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {variant.variant_options.map(opt => `${opt.type_name}: ${opt.value}`).join(', ')}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-gray-900">{variant.price} {arabicTranslations.currency}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{variant.stock}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${variant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {variant.is_active ? 'نشط' : 'غير نشط'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingVariant(variant)
                                      setVariantFormData({
                                        sku: variant.sku,
                                        price: variant.price,
                                        stock: variant.stock,
                                        image_url: variant.image_url,
                                        is_active: variant.is_active,
                                        variant_options: variant.variant_options.map(opt => opt.id)
                                      })
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVariant(variant.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Add/Edit Variant Form */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingVariant ? 'تعديل متغير' : 'إضافة متغير جديد'}
                  </h4>
                  <form onSubmit={handleVariantSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                        <input
                          type="text"
                          required
                          value={variantFormData.sku}
                          onChange={(e) => setVariantFormData(prev => ({ ...prev, sku: e.target.value }))}
                          className="block w-full pr-3 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="أدخل SKU فريد"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={variantFormData.price}
                          onChange={(e) => setVariantFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="block w-full pr-3 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="السعر"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">المخزون</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={variantFormData.stock}
                          onChange={(e) => setVariantFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                          className="block w-full pr-3 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="الكمية المتاحة"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة</label>
                        <input
                          type="url"
                          value={variantFormData.image_url}
                          onChange={(e) => setVariantFormData(prev => ({ ...prev, image_url: e.target.value }))}
                          className="block w-full pr-3 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="رابط الصورة (اختياري)"
                        />
                      </div>
                    </div>

                    {/* Variant Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">خصائص المتغير</label>
                      <div className="space-y-3">
                        {variantTypes.map((type) => (
                          <div key={type.id}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{type.name}</label>
                            <select
                              value={variantFormData.variant_options.find(optId => {
                                const option = variantOptions.find(opt => opt.id === optId)
                                return option?.variant_type_id === type.id
                              }) || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value)
                                if (value) {
                                  // Remove existing option for this type and add new one
                                  const filtered = variantFormData.variant_options.filter(optId => {
                                    const option = variantOptions.find(opt => opt.id === optId)
                                    return option?.variant_type_id !== type.id
                                  })
                                  setVariantFormData(prev => ({
                                    ...prev,
                                    variant_options: [...filtered, value]
                                  }))
                                }
                              }}
                              className="block w-full pr-3 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                              <option value="">اختر {type.name}</option>
                              {variantOptions
                                .filter(opt => opt.variant_type_id === type.id)
                                .map(option => (
                                  <option key={option.id} value={option.id}>
                                    {option.value}
                                  </option>
                                ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="variant-active"
                        checked={variantFormData.is_active}
                        onChange={(e) => setVariantFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="variant-active" className="mr-2 text-sm text-gray-700">نشط</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        {submitting ? 'جاري الحفظ...' : (editingVariant ? 'تحديث' : 'إضافة')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVariant(null)
                          setVariantFormData({
                            sku: '',
                            price: selectedProduct.price,
                            stock: 0,
                            image_url: selectedProduct.image_url,
                            is_active: true,
                            variant_options: []
                          })
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
