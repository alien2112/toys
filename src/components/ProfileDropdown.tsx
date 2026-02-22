import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, ShoppingBag, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './ProfileDropdown.css'

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/')
  }

  const handleProfileClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-button"
        onClick={handleProfileClick}
        aria-label="Profile menu"
      >
        <User size={20} />
        {isAuthenticated && user && (
          <span className="profile-name">{user.name}</span>
        )}
      </button>

      {isOpen && !isAuthenticated && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <h3>مرحباً بك!</h3>
            <p>سجل الدخول للوصول إلى حسابك</p>
          </div>
          
          <div className="dropdown-actions">
            <Link
              to="/login"
              className="dropdown-button primary"
              onClick={() => setIsOpen(false)}
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="dropdown-button secondary"
              onClick={() => setIsOpen(false)}
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      )}

      {isOpen && isAuthenticated && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
          
          <div className="dropdown-links">
            <Link
              to="/profile"
              className="dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              <User size={18} />
              <span>حسابي</span>
            </Link>
            <Link
              to="/orders"
              className="dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag size={18} />
              <span>طلباتي</span>
            </Link>
            <Link
              to="/wishlist"
              className="dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              <Heart size={18} />
              <span>المفضلة</span>
            </Link>
            <Link
              to="/settings"
              className="dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              <span>الإعدادات</span>
            </Link>
          </div>

          <div className="dropdown-divider"></div>

          <button
            className="dropdown-link logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
