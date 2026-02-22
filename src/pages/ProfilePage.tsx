import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Calendar, Shield, Camera, Settings, Package, Heart, Edit2, MapPin } from 'lucide-react'
import './ProfilePage.css'

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) {
    return null
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
      return
    }

    setIsUploadingAvatar(true)

    // Convert to base64 and save
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      updateUser({ avatar: base64String })
      setIsUploadingAvatar(false)
    }
    reader.readAsDataURL(file)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Cover Section */}
        <div className="profile-cover">
          <div className="cover-gradient"></div>
        </div>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-section">
            <div className="profile-avatar-wrapper">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <span className="avatar-initials">{getInitials(user.name)}</span>
                </div>
              )}
              <button 
                className="avatar-upload-button" 
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
              >
                <Camera size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">
                <Mail size={16} />
                {user.email}
              </p>
              {user.phone && (
                <p className="profile-phone">
                  <Phone size={16} />
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <Link to="/settings" className="action-button primary">
              <Edit2 size={18} />
              تعديل الملف الشخصي
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <Link to="/orders" className="quick-link-card">
            <div className="quick-link-icon">
              <Package size={24} />
            </div>
            <div className="quick-link-info">
              <h3>طلباتي</h3>
              <p>تتبع طلباتك</p>
            </div>
          </Link>

          <Link to="/wishlist" className="quick-link-card">
            <div className="quick-link-icon">
              <Heart size={24} />
            </div>
            <div className="quick-link-info">
              <h3>المفضلة</h3>
              <p>منتجاتك المفضلة</p>
            </div>
          </Link>

          <Link to="/settings" className="quick-link-card">
            <div className="quick-link-icon">
              <Settings size={24} />
            </div>
            <div className="quick-link-info">
              <h3>الإعدادات</h3>
              <p>إدارة حسابك</p>
            </div>
          </Link>
        </div>

        {/* Account Details */}
        <div className="profile-content">
          <div className="content-section">
            <h2 className="section-title">
              <User size={24} />
              معلومات الحساب
            </h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">
                  <User size={20} />
                </div>
                <div className="info-details">
                  <span className="info-label">الاسم الكامل</span>
                  <span className="info-value">{user.name}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Mail size={20} />
                </div>
                <div className="info-details">
                  <span className="info-label">البريد الإلكتروني</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Phone size={20} />
                </div>
                <div className="info-details">
                  <span className="info-label">رقم الهاتف</span>
                  <span className="info-value">{user.phone || 'غير محدد'}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Calendar size={20} />
                </div>
                <div className="info-details">
                  <span className="info-label">تاريخ الانضمام</span>
                  <span className="info-value">
                    {new Date().toLocaleDateString('ar-EG', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Shield size={20} />
                </div>
                <div className="info-details">
                  <span className="info-label">حالة الحساب</span>
                  <span className="info-value status-active">
                    <span className="status-dot"></span>
                    نشط
                  </span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <MapPin size={20} />
                </div>
                <div className="info-details">
                  <span className="info-label">الموقع</span>
                  <span className="info-value">المملكة العربية السعودية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
