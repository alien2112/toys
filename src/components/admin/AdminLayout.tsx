import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Orders', href: '/admin/orders', icon: '📦' },
    { name: 'Products', href: '/admin/products', icon: '🛍️' },
    { name: 'Inventory', href: '/admin/inventory', icon: '📋' },
    { name: 'Categories', href: '/admin/categories', icon: '📂' },
    { name: 'Blog', href: '/admin/blogs', icon: '📝' },
    { name: 'Support', href: '/admin/support', icon: '💬' },
    { name: 'Live Chat', href: '/admin/chat', icon: '💭' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Data Seeder', href: '/admin/seeder', icon: '🌱' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-header">
          <div className="admin-logo">
            ⚙️ Admin Panel
          </div>
          <button 
            className="admin-close-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="admin-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`admin-nav-item ${location.pathname === item.href ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header Bar */}
        <div className="admin-header-bar">
          <button 
            className="admin-menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="admin-user-name">
              {user?.name || 'Admin User'}
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
