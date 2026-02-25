import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  Calendar, Clock, ArrowRight, ArrowLeft, 
  Share2, Facebook, Twitter, Linkedin,
  Tag, TrendingUp, Mail, User, BookOpen, Eye, ChevronUp, Menu, X
} from 'lucide-react'
import CountUp from 'react-countup'
import './BlogDetailPage.css'

interface RelatedPost {
  id: number
  title: string
  image: string
  date: string
  readTime: string
  category?: string
  author?: string
  views?: number
}

interface TableOfContentsItem {
  id: string
  title: string
  level: number
}

const BlogDetailPage: React.FC = () => {
  const { id } = useParams()
  const [readingProgress, setReadingProgress] = useState(0)
  const [isTocOpen, setIsTocOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // Mock data - replace with API call
  const post = {
    id: 1,
    title: 'كيف تختار اللعبة المناسبة لعمر طفلك؟',
    author: {
      name: 'د. سارة أحمد',
      avatar: '/placeholder-avatar.jpg',
      bio: 'خبيرة تربوية وتطوير الطفل مع أكثر من 15 عاماً من الخبرة في مجال تنمية مهارات الأطفال',
      credentials: 'دكتوراه في علم النفس التربوي',
      social: {
        twitter: '@sarah_ahmed',
        linkedin: 'sarah-ahmed',
        website: 'sarahahmed.com'
      }
    },
    date: '15 فبراير 2026',
    readTime: '5 دقائق',
    category: 'اختيار الألعاب',
    tags: ['تربية', 'ألعاب تعليمية', 'تطوير المهارات', 'النمو العقلي', 'السلامة'],
    image: '/products/placeholder.svg',
    views: 1520,
    featured: true,
    content: `
      <p>اختيار اللعبة المناسبة لطفلك ليس مجرد قرار عشوائي، بل هو استثمار في تطوره العقلي والجسدي والعاطفي. في هذا المقال، سنستعرض معاً الأسس العلمية لاختيار الألعاب المناسبة لكل مرحلة عمرية.</p>

      <h2>لماذا يهم اختيار اللعبة المناسبة؟</h2>
      <p>الألعاب ليست مجرد وسيلة للترفيه، بل هي أدوات تعليمية قوية تساعد الأطفال على:</p>
      <ul>
        <li>تطوير المهارات الحركية الدقيقة والكبيرة</li>
        <li>تعزيز القدرات المعرفية والإبداعية</li>
        <li>بناء المهارات الاجتماعية والعاطفية</li>
        <li>تحفيز الخيال والتفكير النقدي</li>
      </ul>

      <h2>معايير اختيار الألعاب حسب العمر</h2>
      
      <h3>من الولادة حتى 6 أشهر</h3>
      <p>في هذه المرحلة، يحتاج الطفل إلى ألعاب تحفز حواسه الأساسية:</p>
      <ul>
        <li>ألعاب ذات ألوان متباينة وأصوات ناعمة</li>
        <li>خشخيشات آمنة وسهلة الإمساك</li>
        <li>مرايا آمنة للأطفال</li>
      </ul>

      <blockquote>
        "اللعب هو أعلى شكل من أشكال البحث" - ألبرت أينشتاين
      </blockquote>

      <h3>من 6 إلى 12 شهراً</h3>
      <p>مع بداية الحركة والاستكشاف، يحتاج الطفل إلى:</p>
      <ul>
        <li>ألعاب التكديس والفرز</li>
        <li>كرات ناعمة وآمنة</li>
        <li>ألعاب الدفع والسحب</li>
      </ul>

      <h2>نصائح السلامة المهمة</h2>
      <p>عند اختيار أي لعبة، تأكد من:</p>
      <ol>
        <li>خلوها من القطع الصغيرة التي يمكن بلعها</li>
        <li>استخدام مواد غير سامة وآمنة</li>
        <li>مطابقتها للمعايير العالمية للسلامة</li>
        <li>ملاءمتها للمرحلة العمرية المحددة</li>
      </ol>

      <h2>الخلاصة</h2>
      <p>اختيار اللعبة المناسبة يتطلب فهماً عميقاً لاحتياجات طفلك التطورية. استثمر الوقت في البحث والاختيار، وستجد أن اللعبة الصحيحة يمكن أن تحدث فرقاً كبيراً في نمو طفلك وسعادته.</p>
    `
  }

  const relatedPosts: RelatedPost[] = [
    {
      id: 2,
      title: 'أهمية اللعب في تنمية الذكاء العاطفي',
      image: '/products/placeholder.svg',
      date: '12 فبراير 2026',
      readTime: '7 دقائق',
      category: 'تطوير المهارات',
      author: 'أ. محمد خالد',
      views: 980
    },
    {
      id: 3,
      title: '10 أنشطة منزلية ممتعة',
      image: '/products/placeholder.svg',
      date: '10 فبراير 2026',
      readTime: '6 دقائق',
      category: 'أنشطة منزلية',
      author: 'نورا علي',
      views: 750
    },
    {
      id: 4,
      title: 'معايير السلامة في ألعاب الأطفال',
      image: '/products/placeholder.svg',
      date: '8 فبراير 2026',
      readTime: '8 دقائق',
      category: 'السلامة والأمان',
      author: 'د. أحمد حسن',
      views: 1200
    }
  ]

  const popularPosts: RelatedPost[] = [
    {
      id: 5,
      title: 'كيف تشجع طفلك على القراءة؟',
      image: '/products/placeholder.svg',
      date: '5 فبراير 2026',
      readTime: '5 دقائق',
      category: 'تطوير المهارات',
      author: 'ليلى سالم',
      views: 890
    },
    {
      id: 6,
      title: 'إدارة وقت الشاشة للأطفال',
      image: '/products/placeholder.svg',
      date: '2 فبراير 2026',
      readTime: '6 دقائق',
      category: 'نصائح تربوية',
      author: 'د. مريم يوسف',
      views: 1680
    },
    {
      id: 7,
      title: 'اللعب الإبداعي وتطوير الخيال',
      image: '/products/placeholder.svg',
      date: '30 يناير 2026',
      readTime: '7 دقائق',
      category: 'تطوير المهارات',
      author: 'أ. حسن علي',
      views: 620
    }
  ]

  // Table of Contents
  const tableOfContents: TableOfContentsItem[] = [
    { id: 'introduction', title: 'مقدمة', level: 2 },
    { id: 'why-important', title: 'لماذا يهم اختيار اللعبة المناسبة؟', level: 2 },
    { id: 'age-criteria', title: 'معايير اختيار الألعاب حسب العمر', level: 2 },
    { id: 'safety-tips', title: 'نصائح السلامة المهمة', level: 2 },
    { id: 'conclusion', title: 'الخلاصة', level: 2 }
  ]

  const handleShare = (platform: string) => {
    console.log(`Sharing on ${platform}`)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
      setIsTocOpen(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setReadingProgress(scrollPercent)

      // Update active section based on scroll position
      const sections = tableOfContents.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      }))
      
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="blog-detail-page">
      {/* Reading Progress Bar */}
      <div className="reading-progress">
        <div 
          className="reading-progress-bar" 
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Enhanced Back Navigation */}
      <div className="back-nav">
        <div className="blog-container">
          <Link to="/blog" className="back-link">
            <ArrowRight size={20} />
            العودة إلى المدونة
          </Link>
          
          {/* Mobile TOC Toggle */}
          <button 
            className="toc-toggle mobile"
            onClick={() => setIsTocOpen(!isTocOpen)}
          >
            {isTocOpen ? <X size={20} /> : <Menu size={20} />}
            <span>فهرس المقال</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <article className="article">
        <div className="blog-container">
          <div className="article-layout">
            {/* Table of Contents - Desktop */}
            <aside className={`table-of-contents ${isTocOpen ? 'open' : ''}`}>
              <div className="toc-header">
                <h3 className="toc-title">
                  <BookOpen size={18} />
                  فهرس المقال
                </h3>
                <button 
                  className="toc-close"
                  onClick={() => setIsTocOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="toc-nav">
                {tableOfContents.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`toc-item ${activeSection === item.id ? 'active' : ''} level-${item.level}`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="article-main">
              <header className="article-header">
                {post.featured && (
                  <div className="featured-badge">
                    <TrendingUp size={16} />
                    مقال مميز
                  </div>
                )}
                <div className="article-category">{post.category}</div>
                <h1 className="article-title">{post.title}</h1>
                
                <div className="article-meta">
                  <div className="author-info">
                    <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
                    <div className="author-details">
                      <span className="author-name">{post.author.name}</span>
                      <span className="author-credentials">{post.author.credentials}</span>
                      <span className="author-bio">{post.author.bio}</span>
                    </div>
                  </div>
                  <div className="article-stats">
                    <span className="stat-item">
                      <Calendar size={16} />
                      {post.date}
                    </span>
                    <span className="stat-item">
                      <Clock size={16} />
                      {post.readTime}
                    </span>
                    <span className="stat-item">
                      <Eye size={16} />
                      <CountUp end={post.views} separator="," /> مشاهدة
                    </span>
                  </div>
                </div>
              </header>

              {/* Enhanced Featured Image */}
              <div className="article-image">
                <img src={post.image} alt={post.title} />
              </div>

              {/* Enhanced Share Buttons */}
              <div className="share-section">
                <div className="share-buttons">
                  <span className="share-label">شارك المقال:</span>
                  <button onClick={() => handleShare('facebook')} className="share-btn facebook">
                    <Facebook size={18} />
                  </button>
                  <button onClick={() => handleShare('twitter')} className="share-btn twitter">
                    <Twitter size={18} />
                  </button>
                  <button onClick={() => handleShare('linkedin')} className="share-btn linkedin">
                    <Linkedin size={18} />
                  </button>
                  <button onClick={() => handleShare('copy')} className="share-btn copy">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Article Content with IDs */}
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    .replace('<h2>', '<h2 id="introduction">')
                    .replace('<h2>لماذا يهم اختيار اللعبة المناسبة؟</h2>', '<h2 id="why-important">لماذا يهم اختيار اللعبة المناسبة؟</h2>')
                    .replace('<h2>معايير اختيار الألعاب حسب العمر</h2>', '<h2 id="age-criteria">معايير اختيار الألعاب حسب العمر</h2>')
                    .replace('<h2>نصائح السلامة المهمة</h2>', '<h2 id="safety-tips">نصائح السلامة المهمة</h2>')
                    .replace('<h2>الخلاصة</h2>', '<h2 id="conclusion">الخلاصة</h2>')
                }}
              />

              {/* Enhanced Tags */}
              <div className="article-tags">
                <Tag size={18} />
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>

              {/* Enhanced Post Navigation */}
              <div className="post-navigation">
                <Link to={`/blog/${parseInt(id || '1') - 1}`} className="nav-post prev">
                  <ArrowRight size={20} />
                  <div className="nav-content">
                    <span className="nav-label">المقال السابق</span>
                    <span className="nav-title">10 أنشطة منزلية ممتعة</span>
                  </div>
                </Link>
                <Link to={`/blog/${parseInt(id || '1') + 1}`} className="nav-post next">
                  <div className="nav-content">
                    <span className="nav-label">المقال التالي</span>
                    <span className="nav-title">معايير السلامة في الألعاب</span>
                  </div>
                  <ArrowLeft size={20} />
                </Link>
              </div>

              {/* Enhanced Author Bio */}
              <div className="author-bio-section">
                <h3 className="bio-title">عن الكاتب</h3>
                <div className="bio-content">
                  <img src={post.author.avatar} alt={post.author.name} className="bio-avatar" />
                  <div className="bio-info">
                    <h4 className="bio-name">{post.author.name}</h4>
                    <p className="bio-credentials">{post.author.credentials}</p>
                    <p className="bio-description">{post.author.bio}</p>
                    <div className="bio-social">
                      <a href={`https://twitter.com/${post.author.social.twitter}`} className="social-link">
                        <Twitter size={16} />
                      </a>
                      <a href={`https://linkedin.com/in/${post.author.social.linkedin}`} className="social-link">
                        <Linkedin size={16} />
                      </a>
                      <a href={`https://${post.author.social.website}`} className="social-link">
                        <User size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <aside className="article-sidebar">
              {/* Popular Posts */}
              <div className="sidebar-widget">
                <h3 className="widget-title">
                  <TrendingUp size={20} />
                  الأكثر قراءة
                </h3>
                <div className="widget-posts">
                  {popularPosts.map(post => (
                    <Link key={post.id} to={`/blog/${post.id}`} className="widget-post">
                      <img src={post.image} alt={post.title} className="widget-post-image" />
                      <div className="widget-post-info">
                        <h4 className="widget-post-title">{post.title}</h4>
                        <div className="widget-post-meta">
                          <span className="widget-post-date">{post.date}</span>
                          <span className="widget-post-stats">
                            <Eye size={12} /> <CountUp end={post.views || 0} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories Widget */}
              <div className="sidebar-widget">
                <h3 className="widget-title">
                  <Tag size={20} />
                  الفئات
                </h3>
                <div className="categories-list">
                  {['اختيار الألعاب', 'تطوير المهارات', 'أنشطة منزلية', 'السلامة والأمان', 'نصائح تربوية'].map((category, index) => (
                    <Link key={index} to={`/blog/category/${category}`} className="category-link">
                      {category}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Enhanced Newsletter */}
              <div className="sidebar-widget newsletter-widget">
                <h3 className="widget-title">
                  <Mail size={20} />
                  اشترك في النشرة
                </h3>
                <p className="newsletter-text">
                  احصل على أحدث المقالات والنصائح التربوية مباشرة في بريدك
                </p>
                <form className="newsletter-form">
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="newsletter-button">
                    اشترك
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
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Enhanced Related Posts */}
      <section className="related-posts">
        <div className="blog-container">
          <div className="section-header">
            <h2 className="section-title">مقالات ذات صلة</h2>
            <p className="section-subtitle">اكتشف المزيد من المقالات المفيدة</p>
          </div>
          <div className="related-grid">
            {relatedPosts.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`} className="related-card">
                <div className="related-image">
                  <img src={post.image} alt={post.title} />
                  <div className="related-overlay">
                    <div className="related-category">{post.category}</div>
                  </div>
                </div>
                <div className="related-content">
                  <h3 className="related-title">{post.title}</h3>
                  <div className="related-meta">
                    <span className="meta-item">
                      <User size={14} /> {post.author}
                    </span>
                    <span className="meta-item">
                      <Calendar size={14} /> {post.date}
                    </span>
                    <span className="meta-item">
                      <Clock size={14} /> {post.readTime}
                    </span>
                  </div>
                  <div className="related-stats">
                    <span className="stat-item">
                      <Eye size={14} /> <CountUp end={post.views} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {readingProgress > 20 && (
        <button 
          onClick={scrollToTop}
          className="back-to-top"
          aria-label="العودة للأعلى"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  )
}

export default BlogDetailPage
