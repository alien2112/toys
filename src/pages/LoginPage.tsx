import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    navigate(-1)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      navigate(redirect)
    } catch (err) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" onClick={handleOverlayClick}>
      <div className="login-container">
        <div className="login-card">
          <button className="close-button" onClick={handleClose} aria-label="إغلاق">
            <X size={20} />
          </button>
          <div className="login-header">
            <div className="login-icon">
              <LogIn size={40} />
            </div>
            <h1 className="login-title">تسجيل الدخول</h1>
            <p className="login-subtitle">مرحباً بعودتك! سجل دخولك للمتابعة</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={18} />
                كلمة المرور
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle btn-ripple"
                  aria-label="إظهار/إخفاء كلمة المرور"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>تذكرني</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button type="submit" className="submit-button btn-ripple" disabled={loading}>
              <span className="btn-text">
                {loading ? '' : (
                  <>
                    <LogIn size={20} className="btn-icon-slide" />
                    تسجيل الدخول
                  </>
                )}
              </span>
              {loading && <span className="btn-spinner"></span>}
            </button>
          </form>

          <div className="login-footer">
            <p>ليس لديك حساب؟</p>
            <Link to="/register" className="register-link">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
