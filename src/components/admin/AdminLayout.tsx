import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Package, FolderOpen, Users, Settings, LogOut, BarChart3, ShoppingBag, Boxes, PenTool, Headphones, MessageCircle, Database, Cog } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { arabicTranslations } from '../../data/arabicTranslations'
import './AdminLayout.css'

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: arabicTranslations.dashboard, href: '/admin', icon: LayoutDashboard },
    { name: arabicTranslations.analytics, href: '/admin/analytics', icon: BarChart3 },
    { name: arabicTranslations.orders, href: '/admin/orders', icon: ShoppingBag },
    { name: arabicTranslations.products, href: '/admin/products', icon: Package },
    { name: arabicTranslations.inventory, href: '/admin/inventory', icon: Boxes },
    { name: arabicTranslations.categories, href: '/admin/categories', icon: FolderOpen },
    { name: arabicTranslations.blog, href: '/admin/blogs', icon: PenTool },
    { name: arabicTranslations.support, href: '/admin/support', icon: Headphones },
    { name: arabicTranslations.liveChat, href: '/admin/chat', icon: MessageCircle },
    { name: arabicTranslations.users, href: '/admin/users', icon: Users },
    { name: arabicTranslations.dataSeeder, href: '/admin/seeder', icon: Database },
    { name: arabicTranslations.settings, href: '/admin/settings', icon: Cog },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-header">
          <div className="admin-logo">
            <div className="logo-icon-wrapper">
              <Settings className="logo-icon" size={20} />
            </div>
            <span>{arabicTranslations.adminPanel}</span>
          </div>
          <button 
            className="admin-close-btn"
            onClick={closeSidebar}
            aria-label="إغلاق الشريط الجانبي"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="admin-nav">
          {navigation.map((item, index) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`admin-nav-item ${location.pathname === item.href ? 'active' : ''}`}
                onClick={closeSidebar}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="nav-icon-wrapper">
                  <IconComponent size={18} />
                </div>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="admin-logout-section">
          <button 
            className="admin-logout-btn"
            onClick={() => {
              localStorage.removeItem('auth_token')
              window.location.href = '/login'
            }}
          >
            <div className="logout-icon-wrapper">
              <LogOut size={18} />
            </div>
            <span>{arabicTranslations.logout}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header Bar */}
        <div className="admin-header-bar">
          <button 
            className="admin-menu-toggle"
            onClick={toggleSidebar}
            aria-label="تبديل القائمة"
          >
            <Menu size={20} />
          </button>
          
          <div className="admin-user-info">
            <div className="admin-user-name">
              {arabicTranslations.welcomeAdmin}
            </div>
            <div className="admin-user-avatar">
              <div className="avatar-content">
                {user?.name?.charAt(0) || 'أ'}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-content">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
