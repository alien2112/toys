import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import './SettingsPage.css'

interface Settings {
  social_facebook: string
  social_instagram: string
  social_whatsapp: string
  contact_email: string
  contact_phone: string
  contact_whatsapp: string
  contact_address: string
  contact_hours: string
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    social_facebook: '',
    social_instagram: '',
    social_whatsapp: '',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_address: '',
    contact_hours: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:8000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="admin-loading">جاري التحميل...</div>
  }

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/dashboard')} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h1>إعدادات الموقع</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h2 className="section-title">روابط وسائل التواصل الاجتماعي</h2>
          <p className="section-description">إدارة روابط وسائل التواصل الاجتماعي المعروضة في التذييل</p>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="social_facebook">رابط فيسبوك</label>
              <input
                type="url"
                id="social_facebook"
                name="social_facebook"
                value={settings.social_facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourpage"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_instagram">رابط إنستغرام</label>
              <input
                type="url"
                id="social_instagram"
                name="social_instagram"
                value={settings.social_instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourpage"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_whatsapp">رابط واتساب</label>
              <input
                type="url"
                id="social_whatsapp"
                name="social_whatsapp"
                value={settings.social_whatsapp}
                onChange={handleChange}
                placeholder="https://wa.me/96512345678"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">معلومات التواصل</h2>
          <p className="section-description">إدارة تفاصيل الاتصال المعروضة في صفحة التواصل</p>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="contact_email">البريد الإلكتروني</label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleChange}
                placeholder="support@amanlove.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_phone">رقم الهاتف</label>
              <input
                type="text"
                id="contact_phone"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleChange}
                placeholder="+966 1234 5678"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_whatsapp">رقم واتساب</label>
              <input
                type="text"
                id="contact_whatsapp"
                name="contact_whatsapp"
                value={settings.contact_whatsapp}
                onChange={handleChange}
                placeholder="+96612345678"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_address">العنوان</label>
              <input
                type="text"
                id="contact_address"
                name="contact_address"
                value={settings.contact_address}
                onChange={handleChange}
                placeholder="السعودية"
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="contact_hours">ساعات العمل</label>
              <textarea
                id="contact_hours"
                name="contact_hours"
                value={settings.contact_hours}
                onChange={handleChange}
                placeholder="السبت - الخميس: 9:00 صباحاً - 9:00 مساءً"
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message.includes('success') ? 'تم حفظ الإعدادات بنجاح!' : 'فشل حفظ الإعدادات'}
            </div>
          )}
          <button type="submit" className="save-button" disabled={saving}>
            <Save size={20} />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettingsPage
