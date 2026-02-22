import React, { useState, useMemo, useEffect } from 'react'
import { Calendar, Clock, ArrowLeft, Search, Filter, Star, User, BookOpen, Grid, List, Heart } from 'lucide-react'
import './BlogPage.css'

interface Article {
  id: number
  title: string
  summary: string
  category: string
  date: string
  readTime: string
  image: string
  featured?: boolean
  author?: string
  views?: number
}

interface Category {
  id: number
  name: string
  slug: string
}

const categories: Category[] = [
  { id: 1, name: 'نصائح تربوية', slug: 'parenting-tips' },
  { id: 2, name: 'تطوير المهارات', slug: 'skill-development' },
  { id: 3, name: 'اختيار الألعاب', slug: 'toy-selection' },
  { id: 4, name: 'أنشطة منزلية', slug: 'home-activities' },
  { id: 5, name: 'السلامة والأمان', slug: 'safety' },
]

const BlogCard: React.FC<{ article: Article; featured?: boolean; viewMode?: 'grid' | 'list' }> = ({ article, featured = false, viewMode = 'grid' }) => {
  return (
    <article className={`blog-card ${featured ? 'featured' : ''} ${viewMode}`}>
      <div className="blog-card-image">
        <img src={article.image} alt={article.title} loading="lazy" />
        <div className="blog-card-overlay">
          <span className="blog-card-category">{article.category}</span>
          {featured && <div className="featured-badge"><Star size={16} /> مميز</div>}
        </div>
      </div>
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="meta-item author">
            <User size={14} />
            {article.author}
          </span>
          <span className="meta-item">
            <Calendar size={14} />
            {article.date}
          </span>
          <span className="meta-item">
            <Clock size={14} />
            {article.readTime}
          </span>
        </div>
        <h3 className="blog-card-title">{article.title}</h3>
        <p className="blog-card-summary">{article.summary}</p>
        <div className="blog-card-actions">
          <a href={`/blog/${article.id}`} className="blog-card-link">
            اقرأ المزيد
            <ArrowLeft size={16} />
          </a>
        </div>
      </div>
    </article>
  )
}

const BlogPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'latest' | 'trending'>('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      
      // Fetch featured blogs
      const featuredResponse = await fetch('/api/blogs/featured?limit=3')
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        const featuredArticlesData = featuredData.blogs || featuredData || []
        setFeaturedArticles(featuredArticlesData.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          summary: blog.summary,
          category: blog.category_name || blog.category,
          date: new Date(blog.published_at || blog.created_at).toLocaleDateString('ar-SA'),
          readTime: blog.read_time || '5 دقائق',
          image: blog.image_url || '/products/placeholder.svg',
          featured: true,
          author: blog.author_name,
          views: blog.views
        })))
      }
      
      // Fetch all blogs
      const allBlogsResponse = await fetch('/api/blogs?status=published&limit=50')
      if (allBlogsResponse.ok) {
        const allBlogsData = await allBlogsResponse.json()
        const allArticlesData = allBlogsData.blogs || allBlogsData || []
        
        const allArticles = allArticlesData.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          summary: blog.summary,
          category: blog.category_name || blog.category,
          date: new Date(blog.published_at || blog.created_at).toLocaleDateString('ar-SA'),
          readTime: blog.read_time || '5 دقائق',
          image: blog.image_url || '/products/placeholder.svg',
          featured: blog.featured || false,
          author: blog.author_name,
          views: blog.views
        }))
        
        setArticles(allArticles)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      // Fallback to hardcoded data if API fails
      setArticles([
        {
          id: 1,
          title: 'كيف تختار اللعبة المناسبة لعمر طفلك؟',
          summary: 'دليل شامل لمساعدتك في اختيار الألعاب التي تناسب المرحلة العمرية لطفلك وتساهم في تطوير مهاراته بشكل صحيح.',
          category: 'اختيار الألعاب',
          date: '15 فبراير 2026',
          readTime: '5 دقائق',
          image: '/products/placeholder.svg',
          featured: true,
          author: 'د. سارة أحمد',
          views: 1520
        },
        {
          id: 2,
          title: 'أهمية اللعب في تنمية الذكاء العاطفي للأطفال',
          summary: 'اكتشف كيف يساعد اللعب الحر والموجه في بناء الذكاء العاطفي والاجتماعي لدى الأطفال من مختلف الأعمار.',
          category: 'تطوير المهارات',
          date: '12 فبراير 2026',
          readTime: '7 دقائق',
          image: '/products/placeholder.svg',
          author: 'أ. محمد خالد',
          views: 980
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const regularArticles = articles.filter(article => !article.featured)

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = regularArticles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort articles
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'trending') return (b.views || 0) - (a.views || 0)
      return 0 // Keep original order for 'latest'
    })

    return filtered
  }, [regularArticles, searchTerm, selectedCategory, sortBy])

  const totalPages = Math.ceil(filteredAndSortedArticles.length / postsPerPage)
  const paginatedArticles = filteredAndSortedArticles.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="blog-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>جاري تحميل المقالات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-page">
      {/* Enhanced Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="blog-container">
          <div className="hero-content">
            <div className="hero-badge">
              <BookOpen size={16} />
              مدونة AMANLOVE
            </div>
            <h1 className="blog-hero-title">
              نصائح تربوية وأفكار إبداعية
              <span className="hero-highlight">لعالم الألعاب التعليمية</span>
            </h1>
            <p className="blog-hero-text">
              دليلك الشامل لتنمية مهارات طفلك من خلال اللعب الممتع والتعليمي
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">150+</span>
                <span className="stat-label">مقالة</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">قارئ</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.8</span>
                <span className="stat-label">تقييم</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="search-filter-section">
        <div className="blog-container">
          <div className="search-filter-container">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="ابحث في المقالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-button">
                بحث
              </button>
            </form>
            
            <div className="filter-controls">
              <div className="category-filter">
                <Filter size={16} className="filter-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="category-select"
                >
                  <option value="all">جميع الفئات</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="sort-filter">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'trending')}
                  className="sort-select"
                >
                  <option value="latest">الأحدث</option>
                  <option value="trending">الأكثر مشاهدة</option>
                </select>
              </div>
              
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredArticles.length > 0 && (
        <section className="featured-section">
          <div className="blog-container">
            <div className="section-header">
              <h2 className="section-title">
                <Star className="title-icon" size={24} />
                المقالات المميزة
              </h2>
            </div>
            <div className={`featured-articles-container ${viewMode}`}>
              {featuredArticles.map(article => (
                <BlogCard key={article.id} article={article} featured={true} viewMode={viewMode} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories-section">
        <div className="blog-container">
          <div className="section-header">
            <h2 className="section-title">تصفح حسب الفئة</h2>
          </div>
          <div className="categories-grid">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.name)}
                className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid/List */}
      <section className="articles-section">
        <div className="blog-container">
          <div className="section-header">
            <h2 className="section-title">
              {searchTerm ? `نتائج البحث: "${searchTerm}"` : 'أحدث المقالات'}
              <span className="results-count">({filteredAndSortedArticles.length} مقال)</span>
            </h2>
          </div>
          
          {paginatedArticles.length > 0 ? (
            <>
              <div className={`articles-container ${viewMode}`}>
                {paginatedArticles.map(article => (
                  <BlogCard key={article.id} article={article} viewMode={viewMode} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-button prev"
                  >
                    السابق
                  </button>
                  
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-button next"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <Search size={48} />
              </div>
              <h3>لا توجد نتائج</h3>
              <p>لم نجد مقالات تطابق بحثك. جرب تغيير الكلمات المفتاحية أو الفئة.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setCurrentPage(1)
                }}
                className="reset-filters"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Newsletter CTA Section */}
      <section className="newsletter-section">
        <div className="blog-container">
          <div className="newsletter-content">
            <div className="newsletter-badge">
              <Heart size={16} />
              انضم لمجتمعنا
            </div>
            <h2 className="newsletter-title">
              احصل على أحدث النصائح التربوية
              <span className="newsletter-highlight">مباشرة في بريدك</span>
            </h2>
            <p className="newsletter-text">
              انضم إلى أكثر من 50,000 أم وأب يحصلون على محتوى حصري وعروض مميزة أسبوعياً
            </p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-button">
                اشترك الآن
                <ArrowLeft size={16} />
              </button>
            </form>
            <div className="newsletter-benefits">
              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <span>محتوى حصري</span>
              </div>
              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <span>عروض مميزة</span>
              </div>
              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <span>إلغاء الاشتراك في أي وقت</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogPage
