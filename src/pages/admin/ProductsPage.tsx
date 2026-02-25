import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import './ProductsPage.css'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  category_id: number
  image_url: string
  stock: number
  is_featured: boolean
  is_active: boolean
}

interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    is_featured: false,
    is_active: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products')
      const data = await response.json()
      if (data.success) {
        // API returns data.products, not data directly
        const productsList = data.data.products || data.data || []
        setProducts(Array.isArray(productsList) ? productsList : [])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category_id: product.category_id.toString(),
        stock: product.stock.toString(),
        is_featured: product.is_featured,
        is_active: product.is_active
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        stock: '',
        is_featured: false,
        is_active: true
      })
    }
    setImageFile(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setImageFile(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let imageUrl = editingProduct?.image_url || '/products/placeholder.svg'

      // Only upload image if a file was selected
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', imageFile)

        try {
          const uploadResponse = await fetch('http://localhost:8000/api/upload/product', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: uploadFormData
          })

          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            imageUrl = uploadData.data.url
          }
        } catch (uploadError) {
          console.error('Image upload failed, using default:', uploadError)
          // Continue with default image if upload fails
        }
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        stock: parseInt(formData.stock),
        image_url: imageUrl
        // Don't send slug - let backend generate it
      }

      const url = editingProduct
        ? `http://localhost:8000/api/products/${editingProduct.id}`
        : 'http://localhost:8000/api/products'

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(productData)
      })

      const data = await response.json()
      if (data.success) {
        fetchProducts()
        handleCloseModal()
      } else {
        alert('فشل حفظ المنتج: ' + (data.message || 'خطأ غير معروف'))
      }
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('فشل حفظ المنتج')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()
      if (data.success) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const toggleFeatured = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}/toggle-featured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error)
    }
  }

  if (loading) {
    return <div className="admin-loading">جاري التحميل...</div>
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/dashboard')} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h1>إدارة المنتجات</h1>
        </div>
        <button onClick={() => handleOpenModal()} className="add-button">
          <Plus size={20} />
          إضافة منتج جديد
        </button>
      </div>

      <div className="products-grid">
        {products.length > 0 ? products.map(product => (
          <div key={product.id} className="product-card-admin">
            <div className="product-image-admin">
              <img src={product.image_url} alt={product.name} />
              {product.is_featured && <span className="featured-badge">مميز</span>}
            </div>
            <div className="product-info-admin">
              <h3>{product.name}</h3>
              <p className="product-price-admin">{product.price} ر.س</p>
              <p className="product-stock-admin">المخزون: {product.stock}</p>
            </div>
            <div className="product-actions">
              <button onClick={() => toggleFeatured(product.id)} className="btn-featured">
                {product.is_featured ? 'إلغاء التمييز' : 'تمييز'}
              </button>
              <button onClick={() => handleOpenModal(product)} className="btn-edit">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(product.id)} className="btn-delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#718096' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>لا توجد منتجات حتى الآن</p>
            <p>ابدأ بإضافة منتج جديد باستخدام الزر أعلاه</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
              <button onClick={handleCloseModal} className="close-button">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">اسم المنتج</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">الوصف</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">السعر (ر.س)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">المخزون</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category_id">الفئة</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="image">صورة المنتج</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                />
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />
                  <span>منتج مميز</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>نشط</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  إلغاء
                </button>
                <button type="submit" className="btn-save">
                  <Save size={20} />
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
