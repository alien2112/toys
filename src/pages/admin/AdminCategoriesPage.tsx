import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, CheckCircle, X } from 'lucide-react'
import './AdminCategoriesPage.css'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  product_count: number
  created_at: string
  updated_at: string
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      } else {
        console.error('Failed to fetch categories:', data.message)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCategories()
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/categories/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      } else {
        console.error('Failed to search categories:', data.message)
      }
    } catch (error) {
      console.error('Error searching categories:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const response = await fetch('http://localhost:8000/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage('Category created successfully!')
        setShowAddModal(false)
        setFormData({ name: '', slug: '', description: '' })
        fetchCategories()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: data.message || 'Failed to create category' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !selectedCategory) return

    try {
      const response = await fetch(`http://localhost:8000/api/admin/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage('Category updated successfully!')
        setShowEditModal(false)
        setSelectedCategory(null)
        setFormData({ name: '', slug: '', description: '' })
        fetchCategories()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: data.message || 'Failed to update category' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`http://localhost:8000/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage('Category deleted successfully!')
        setShowDeleteModal(false)
        setSelectedCategory(null)
        fetchCategories()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: data.message || 'Failed to delete category' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }
  }

  const openEditModal = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    })
    setErrors({})
    setShowEditModal(true)
  }

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteModal(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-اآءئؤةببتةثجحخدذرزسشصضطظعغفقكلمنهويى]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: formData.slug || generateSlug(name)
    }))
  }

  if (loading) {
    return (
      <div className="admin-categories-loading">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-header">
        <div className="header-content">
          <h1>Category Management</h1>
          <p>Manage product categories and their assignments</p>
        </div>
        <button 
          className="add-category-btn"
          onClick={() => {
            setFormData({ name: '', slug: '', description: '' })
            setErrors({})
            setShowAddModal(true)
          }}
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="categories-controls">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="search-btn">
            Search
          </button>
        </div>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-header">
              <div className="category-info">
                <h3>{category.name}</h3>
                <span className="category-slug">{category.slug}</span>
              </div>
              <div className="category-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => openEditModal(category)}
                  title="Edit category"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => openDeleteModal(category)}
                  title="Delete category"
                  disabled={category.product_count > 0}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
            
            <div className="category-stats">
              <div className="stat-item">
                <Package size={16} />
                <span>{category.product_count} products</span>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="no-categories">
            <Package size={48} />
            <h3>No categories found</h3>
            <p>Start by adding your first category</p>
            <button 
              className="add-first-category-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={20} />
              Add First Category
            </button>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="modal-form">
              {errors.general && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter category name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className={errors.slug ? 'error' : ''}
                  placeholder="category-slug"
                />
                {errors.slug && <span className="error-text">{errors.slug}</span>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description (optional)"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditCategory} className="modal-form">
              {errors.general && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter category name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className={errors.slug ? 'error' : ''}
                  placeholder="category-slug"
                />
                {errors.slug && <span className="error-text">{errors.slug}</span>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description (optional)"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>Delete Category</h2>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-content">
              <AlertCircle size={48} className="warning-icon" />
              <h3>Are you sure?</h3>
              <p>
                You are about to delete the category "<strong>{selectedCategory.name}</strong>".
                {selectedCategory.product_count > 0 && (
                  <>
                    <br /><br />
                    <strong>Warning:</strong> This category contains {selectedCategory.product_count} products. 
                    You cannot delete categories with products.
                  </>
                )}
              </p>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteCategory}
                disabled={selectedCategory.product_count > 0}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategoriesPage
