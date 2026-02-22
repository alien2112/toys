import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import './Footer.css'

interface FeaturedProduct {
  id: number
  name: string
  price: string
  image: string
}

const Footer: React.FC = () => {
  const { settings } = useSettings()
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [topRatedProducts, setTopRatedProducts] = useState<FeaturedProduct[]>([])

  const socialLinks = {
    facebook: settings.facebook_url,
    instagram: settings.instagram_url,
    whatsapp: settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}` : '#'
  }

  useEffect(() => {
    const fetchFooterProducts = async () => {
      try {
        // Fetch featured products
        const featuredResponse = await fetch('http://localhost:8000/api/products/featured?limit=1')
        const featuredData = await featuredResponse.json()

        // Fetch top-rated products
        const topRatedResponse = await fetch('http://localhost:8000/api/products/top-rated?limit=3')
        const topRatedData = await topRatedResponse.json()

        if (featuredData.success) {
          setFeaturedProducts(featuredData.data.map((p: any) => {
            // Use the image_url directly since it already contains the full URL
            const imageUrl = p.image_url || (p.images && p.images.length > 0
              ? `http://localhost:8000${p.images[0].image_url}`
              : null);

            return {
              id: p.id,
              name: p.name,
              price: p.price.toString(),
              image: imageUrl
            };
          }));
        }

        if (topRatedData.success) {
          setTopRatedProducts(topRatedData.data.map((p: any) => {
            // Use the image_url directly since it already contains the full URL
            const imageUrl = p.image_url || (p.images && p.images.length > 0
              ? `http://localhost:8000${p.images[0].image_url}`
              : null);

            return {
              id: p.id,
              name: p.name,
              price: p.price.toString(),
              image: imageUrl
            };
          }));
        }
      } catch (error) {
        console.error('Failed to fetch footer products:', error)
        // Fallback to empty arrays on error
        setFeaturedProducts([])
        setTopRatedProducts([])
      }
    }

    fetchFooterProducts()
  }, [])

  return (
    <footer className="footer">
      {/* Products Sidebar Section */}
      <section className="products-sidebar">
        <div className="sidebar-container">
          <div className="sidebar-column">
            <h3 className="sidebar-title">منتجات مميزة</h3>
            <div className="sidebar-products">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`} className="sidebar-product">
                    <div className="sidebar-product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="sidebar-product-info">
                      <h4 className="sidebar-product-name">{product.name}</h4>
                      <div className="sidebar-product-price">
                        <span className="price-amount">{product.price}</span>
                        <span className="price-currency">ر.س</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="sidebar-loading">
                  <span>جاري التحميل...</span>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-column">
            <h3 className="sidebar-title">الأعلى تقييماً</h3>
            <div className="sidebar-products">
              {topRatedProducts.length > 0 ? (
                topRatedProducts.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`} className="sidebar-product">
                    <div className="sidebar-product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="sidebar-product-info">
                      <h4 className="sidebar-product-name">{product.name}</h4>
                      <div className="sidebar-product-price">
                        <span className="price-amount">{product.price}</span>
                        <span className="price-currency">ر.س</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="sidebar-loading">
                  <span>جاري التحميل...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <div className="newsletter-form-wrapper">
              <div className="newsletter-header">
                <div className="newsletter-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="newsletter-text">
                  <h2 className="newsletter-title">انضم إلى نشرتنا البريدية</h2>
                  <p className="newsletter-subtitle">احصل على أحدث الألعاب والعروض الحصرية مباشرة في بريدك</p>
                </div>
              </div>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <div className="newsletter-input-group">
                  <div className="input-container">
                    <div className="input-icon-wrapper">
                      <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="footer-email"
                      placeholder="بريدك الإلكتروني..."
                      className="email-input"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    <span className="btn-text">اشترك</span>
                    <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
                <div className="form-benefits">
                  <div className="benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22,4 12,14.01 9,11.01"></polyline>
                    </svg>
                    <span>عروض حصرية</span>
                  </div>
                  <div className="benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>خصوصية محفوظة</span>
                  </div>
                  <div className="benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 7l-7 5 7 5V7z"></path>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    <span>محتوى مميز</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="newsletter-logo">
              <div className="logo-large">
                {settings.footer_logo_url ? (
                  <img
                    src={settings.footer_logo_url}
                    alt={settings.store_name}
                    className="footer-logo-image"
                    style={{ height: '40px', width: 'auto', marginBottom: '0.5rem' }}
                  />
                ) : (
                  <Heart size={24} fill="currentColor" strokeWidth={0} className="logo-heart" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.4rem' }} />
                )}
                {!settings.footer_logo_url && (
                  <span className="logo-text">{settings.store_name}</span>
                )}
              </div>
              <p className="logo-tagline">متجر الألعاب المميز</p>
              <div className="social-links">
                <a href={socialLinks.facebook} className="social-link facebook" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href={socialLinks.instagram} className="social-link instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href={socialLinks.whatsapp} className="social-link whatsapp" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Bar */}
      <section className="copyright-section">
        <div className="copyright-container">
          <p className="copyright-text">© {new Date().getFullYear()} {settings.store_name}. All Rights Reserved.</p>
          <div className="copyright-links">
            <Link to="/policies">الشروط والأحكام</Link>
            <span className="copyright-divider">|</span>
            <Link to="/faq">الأسئلة الشائعة</Link>
          </div>
        </div>
      </section>
    </footer>
  )
}

export default Footer
