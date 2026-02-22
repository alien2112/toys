import React, { useState, useEffect } from 'react'
import { Settings, User, Lock, Phone, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './SettingsPage.css'

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [editMode, setEditMode] = useState<'none' | 'profile' | 'password'>('none')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Simulate API call - in production, call backend API
    setTimeout(() => {
      // Update user in context and localStorage
      updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      })
      
      setMessage({ type: 'success', text: 'تم تحديث المعلومات بنجاح' })
      setEditMode('none')
      setLoading(false)
    }, 1000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
      return
    }

    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' })
      setEditMode('none')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setLoading(false)
    }, 1000)
  }

  const cancelEdit = () => {
    setEditMode('none')
    // Reset to current user data
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setMessage(null)
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <Settings size={40} />
          <h1 className="settings-title">الإعدادات</h1>
          <p className="settings-subtitle">إدارة معلومات حسابك</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="settings-content">
          {/* Profile Information Section */}
          <div className="settings-section">
            <div className="section-header">
              <User size={24} />
              <h2 className="section-title">المعلومات الشخصية</h2>
            </div>
            
            {editMode === 'profile' ? (
              <form onSubmit={handleProfileSubmit} className="edit-form">
                <div className="form-group">
                  <label className="form-label">
                    <User size={18} />
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={18} />
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={18} />
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                  <button type="button" className="cancel-button" onClick={cancelEdit}>
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="settings-group">
                <div className="setting-item">
                  <span className="setting-label">الاسم</span>
                  <span className="setting-value">{user?.name}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">البريد الإلكتروني</span>
                  <span className="setting-value">{user?.email}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">رقم الهاتف</span>
                  <span className="setting-value">{user?.phone || 'غير محدد'}</span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => setEditMode('profile')}
                >
                  تعديل المعلومات
                </button>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="settings-section">
            <div className="section-header">
              <Lock size={24} />
              <h2 className="section-title">كلمة المرور</h2>
            </div>
            
            {editMode === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="edit-form">
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={18} />
                    كلمة المرور الحالية
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="password-toggle"
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={18} />
                    كلمة المرور الجديدة
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="password-toggle"
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={18} />
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="password-toggle"
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                  </button>
                  <button type="button" className="cancel-button" onClick={cancelEdit}>
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="settings-group">
                <div className="setting-item">
                  <span className="setting-label">كلمة المرور</span>
                  <span className="setting-value">••••••••</span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => setEditMode('password')}
                >
                  تغيير كلمة المرور
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
