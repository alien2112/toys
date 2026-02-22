import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '../services/api'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'amanlove_user'
const TOKEN_STORAGE_KEY = 'auth_token'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    
    if (token && savedUser) {
      try {
        // Check if token is expired
        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          const currentTime = Date.now() / 1000
          
          if (payload.exp && payload.exp < currentTime) {
            // Token expired, clear storage
            localStorage.removeItem(TOKEN_STORAGE_KEY)
            localStorage.removeItem(AUTH_STORAGE_KEY)
            setUser(null)
          } else {
            // Token valid, restore user
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (error) {
        console.error('Error validating token:', error)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await apiService.login({ email, password })
      
      const user: User = {
        id: response.user.id,
        name: `${response.user.first_name} ${response.user.last_name}`,
        email: response.user.email,
        role: response.user.role
      }
      
      setUser(user)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      // Token is already stored by apiService.login()
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Split name into first_name and last_name
      const nameParts = name.trim().split(' ')
      const first_name = nameParts[0]
      const last_name = nameParts.slice(1).join(' ') || nameParts[0]
      
      const response = await apiService.register({
        email,
        password,
        first_name,
        last_name
      })
      
      const user: User = {
        id: response.user.id,
        name: `${response.user.first_name} ${response.user.last_name}`,
        email: response.user.email,
        role: response.user.role
      }
      
      setUser(user)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      // Token is already stored by apiService.register()
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  const updateUser = (userData: Partial<User>) => {
    if (!user) return

    const updatedUser = {
      ...user,
      ...userData
    }
    setUser(updatedUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
