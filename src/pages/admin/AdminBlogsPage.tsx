import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Star, Eye, Calendar, X } from 'lucide-react'
import './AdminBlogsPage.css'

interface Blog {
  id: number
  title: string
  summary: string
  category: string
  author_name: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  views: number
  published_at?: string
  created_at: string
  updated_at: string
  category_name?: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

const AdminBlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchBlogs()
  }, [pagination.currentPage, searchTerm, statusFilter, featuredFilter])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      })

      const response = await fetch(`/api/admin/blogs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch blogs')
      
      const data = await response.json()
      setBlogs(data.blogs || [])
      
      // Fetch total count for pagination
      const countResponse = await fetch(`/api/admin/blogs/count?search=${searchTerm}&status=${statusFilter === 'all' ? '' : statusFilter}`)
      if (countResponse.ok) {
        const countData = await countResponse.json()
        const totalItems = countData.count || 0
        setPagination(prev => ({
          ...prev,
          totalItems,
          totalPages: Math.ceil(totalItems / prev.itemsPerPage)
        }))
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (blogId: number) => {
    try {
      setActionLoading(`featured-${blogId}`)
      const response = await fetch(`/api/admin/blogs/${blogId}/toggle-featured`, {
        method: 'PUT'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to toggle featured status')
      }
      
      await fetchBlogs()
    } catch (error: any) {
      console.error('Error toggling featured:', error)
      alert(error.message || 'Failed to update featured status')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteBlog = async () => {
    if (!blogToDelete) return

    try {
      setActionLoading(`delete-${blogToDelete.id}`)
      const response = await fetch(`/api/admin/blogs/${blogToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete blog')
      
      setShowDeleteModal(false)
      setBlogToDelete(null)
      await fetchBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: '#F59E0B', bg: '#FEF3C7', text: 'مسودة' },
      published: { color: '#10B981', bg: '#D1FAE5', text: 'منشور' },
      archived: { color: '#6B7280', bg: '#F3F4F6', text: 'مؤرشف' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: config.bg,
          color: config.color
        }}
      >
        {config.text}
      </span>
    )
  }

  const featuredBlogsCount = blogs.filter(blog => blog.featured).length

  if (loading && blogs.length === 0) {
    return (
      <div className="admin-blogs-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>جاري تحميل المقالات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-blogs-page">
      <div className="page-header">
        <div className="header-content">
          <h1>إدارة المدونة</h1>
          <p>إدارة مقالات المدونة والمحتوى</p>
        </div>
        <button className="add-button">
          <Plus size={20} />
          مقال جديد
        </button>
      </div>

      {/* Featured Blogs Counter */}
      <div className="featured-counter">
        <div className="counter-content">
          <Star size={20} className="featured-icon" />
          <div className="counter-info">
            <span className="counter-number">{featuredBlogsCount}/3</span>
            <span className="counter-label">مقالات مميزة</span>
          </div>
        </div>
        {featuredBlogsCount >= 3 && (
          <div className="counter-warning">
            لقد وصلت إلى الحد الأقصى للمقالات المميزة
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="البحث في المقالات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-dropdown">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
              <option value="archived">مؤرشف</option>
            </select>
          </div>
          
          <div className="filter-dropdown">
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع المقالات</option>
              <option value="featured">المميزة فقط</option>
              <option value="not-featured">غير المميزة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="blogs-table-container">
        {blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Edit2 size={48} />
            </div>
            <h3>لا توجد مقالات</h3>
            <p>ابدأ بإنشاء أول مقال في المدونة</p>
            <button className="add-button">
              <Plus size={20} />
              إنشاء مقال جديد
            </button>
          </div>
        ) : (
          <div className="blogs-table">
            <div className="table-header">
              <div className="header-cell title">المقال</div>
              <div className="header-cell author">الكاتب</div>
              <div className="header-cell category">الفئة</div>
              <div className="header-cell status">الحالة</div>
              <div className="header-cell featured">مميز</div>
              <div className="header-cell views">المشاهدات</div>
              <div className="header-cell date">التاريخ</div>
              <div className="header-cell actions">الإجراءات</div>
            </div>
            
            <div className="table-body">
              {blogs.map((blog) => (
                <div key={blog.id} className="table-row">
                  <div className="cell title">
                    <div className="blog-info">
                      <h4>{blog.title}</h4>
                      <p>{blog.summary.substring(0, 100)}...</p>
                    </div>
                  </div>
                  
                  <div className="cell author">
                    <span>{blog.author_name}</span>
                  </div>
                  
                  <div className="cell category">
                    <span>{blog.category_name || blog.category}</span>
                  </div>
                  
                  <div className="cell status">
                    {getStatusBadge(blog.status)}
                  </div>
                  
                  <div className="cell featured">
                    <button
                      onClick={() => toggleFeatured(blog.id)}
                      disabled={actionLoading === `featured-${blog.id}` || (blog.featured === false && featuredBlogsCount >= 3)}
                      className={`featured-toggle ${blog.featured ? 'featured' : ''}`}
                      title={blog.featured ? 'إلغاء التمييز' : 'تمييز المقال'}
                    >
                      <Star size={16} />
                      {actionLoading === `featured-${blog.id}` ? (
                        <div className="mini-spinner"></div>
                      ) : null}
                    </button>
                  </div>
                  
                  <div className="cell views">
                    <div className="views-info">
                      <Eye size={14} />
                      <span>{blog.views.toLocaleString('ar-SA')}</span>
                    </div>
                  </div>
                  
                  <div className="cell date">
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>{new Date(blog.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  
                  <div className="cell actions">
                    <div className="action-buttons">
                      <button className="action-button edit" title="تعديل">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-button delete" 
                        title="حذف"
                        onClick={() => {
                          setBlogToDelete(blog)
                          setShowDeleteModal(true)
                        }}
                        disabled={actionLoading === `delete-${blog.id}`}
                      >
                        {actionLoading === `delete-${blog.id}` ? (
                          <div className="mini-spinner"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="pagination-button"
          >
            السابق
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                className={`pagination-number ${pagination.currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="pagination-button"
          >
            التالي
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>تأكيد الحذف</h3>
              <button 
                className="close-button"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <p>هل أنت متأكد من حذف المقال "{blogToDelete.title}"؟</p>
              <p className="warning-text">هذا الإجراء لا يمكن التراجع عنه.</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
              >
                إلغاء
              </button>
              <button 
                className="delete-button"
                onClick={deleteBlog}
                disabled={actionLoading === `delete-${blogToDelete.id}`}
              >
                {actionLoading === `delete-${blogToDelete.id}` ? (
                  <div className="mini-spinner"></div>
                ) : (
                  'حذف'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBlogsPage
