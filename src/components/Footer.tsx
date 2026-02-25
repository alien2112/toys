import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
