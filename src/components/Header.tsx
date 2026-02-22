import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Settings, Heart, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import ProfileDropdown from './ProfileDropdown'
import ChatWidget from './ChatWidget'
import './Header.css'

const Header: React.FC = () => {
  const { totalItems } = useCart()
  const { user } = useAuth()
  const { settings } = useSettings()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    // Prevent body scroll when menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    // Restore body scroll
    document.body.style.overflow = ''
  }

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <Link to="/" className="logo">
              {settings.header_logo_url ? (
                <img 
                  src={settings.header_logo_url} 
                  alt={settings.store_name}
                  className="logo-image"
                />
              ) : (
                <>
                  <span className="logo-text">{settings.store_name}</span>
                  <Heart size={18} fill="currentColor" strokeWidth={0} className="logo-heart" />
                </>
              )}
            </Link>
          </div>

          <nav className="nav-container">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/about" className="nav-link">من نحن؟</Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link">اتصل بنا</Link>
              </li>
              <li className="nav-item">
                <Link to="/blog" className="nav-link">المدونة</Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link">جميع الألعاب</Link>
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin/dashboard" className="nav-link admin-link">
                    <Settings size={16} />
                    لوحة التحكم
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="header-actions">
            <Link to="/cart" className="cart-link">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
            <ProfileDropdown />
          </div>

          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-panel">
          <div className="mobile-nav-header">
            <div className="logo-container">
              <Link to="/" className="logo" onClick={closeMobileMenu}>
                {settings.header_logo_url ? (
                  <img 
                    src={settings.header_logo_url} 
                    alt={settings.store_name}
                    className="logo-image"
                  />
                ) : (
                  <>
                    <span className="logo-text">{settings.store_name}</span>
                    <Heart size={18} fill="currentColor" strokeWidth={0} className="logo-heart" />
                  </>
                )}
              </Link>
            </div>
            <button 
              className="mobile-nav-close"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="mobile-nav-content">
            <ul className="mobile-nav-list">
              <li className="mobile-nav-item">
                <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
                  من نحن؟
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
                  اتصل بنا
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>
                  المدونة
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/products" className="mobile-nav-link" onClick={closeMobileMenu}>
                  جميع الألعاب
                </Link>
              </li>
              {user?.role === 'admin' && (
                <li className="mobile-nav-item">
                  <Link to="/admin/dashboard" className="mobile-nav-link admin-link" onClick={closeMobileMenu}>
                    <Settings size={16} />
                    لوحة التحكم
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
      
      <ChatWidget />
    </>
  )
}

export default Header
