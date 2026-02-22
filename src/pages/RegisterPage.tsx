import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './RegisterPage.css'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح'
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await register(formData.name, formData.email, formData.password)
      setSuccess(true)
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setErrors({ ...errors, email: 'حدث خطأ أثناء إنشاء الحساب' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="register-page" onClick={handleOverlayClick}>
        <div className="register-container">
          <div className="success-card">
            <button className="close-button" onClick={handleClose} aria-label="إغلاق">
              <X size={20} />
            </button>
            <div className="success-icon">
              <CheckCircle size={80} />
            </div>
            <h2 className="success-title">تم إنشاء الحساب بنجاح!</h2>
            <p className="success-message">جاري تحويلك إلى الصفحة الرئيسية...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page" onClick={handleOverlayClick}>
      <div className="register-container">
        <div className="register-card">
          <button className="close-button" onClick={handleClose} aria-label="إغلاق">
            <X size={20} />
          </button>
          <div className="register-header">
            <div className="register-icon">
              <UserPlus size={40} />
            </div>
            <h1 className="register-title">إنشاء حساب جديد</h1>
            <p className="register-subtitle">انضم إلينا وابدأ التسوق الآن</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <User size={18} />
                الاسم الكامل
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="أدخل اسمك الكامل"
              />
              {errors.name && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.name}
                </span>
              )}
            </div>

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
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.email}
                </span>
              )}
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
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label="إظهار/إخفاء كلمة المرور"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={18} />
                تأكيد كلمة المرور
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  aria-label="إظهار/إخفاء كلمة المرور"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <UserPlus size={20} />
                  إنشاء الحساب
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>لديك حساب بالفعل؟</p>
            <Link to="/login" className="login-link">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
