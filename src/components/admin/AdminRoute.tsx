import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface AdminRouteProps {
  children?: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()

  // If user is authenticated but not admin, redirect to home
  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/" state={{ message: 'Access denied' }} replace />
  }

  // Allow access to admin routes without authentication
  // This removes the login requirement
  return children ? <>{children}</> : <Outlet />
}

export default AdminRoute
