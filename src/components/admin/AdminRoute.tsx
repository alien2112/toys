import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface AdminRouteProps {
  children?: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" state={{ message: 'Access denied' }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default AdminRoute
