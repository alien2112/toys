import React, { useEffect, useState } from 'react'
import { useSettings } from '../../context/SettingsContext'

interface Settings {
  store_name: string
  store_email: string
  store_phone: string
  store_address: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  whatsapp_number: string
  header_logo_url: string
  footer_logo_url: string
  dinosaurs_banner_url: string
  balloons_banner_url: string
}

const AdminSettingsPage: React.FC = () => {
  const { refreshSettings } = useSettings()
  const [settings, setSettings] = useState<Settings>({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    whatsapp_number: '',
    header_logo_url: '',
    footer_logo_url: '',
    dinosaurs_banner_url: '',
    balloons_banner_url: ''
  })
  const [originalSettings, setOriginalSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/settings')
      const data = await response.json()
      
      if (data.success) {
        const fetchedSettings = data.data.settings || {}
        const defaultSettings: Settings = {
          store_name: '',
          store_email: '',
          store_phone: '',
          store_address: '',
          facebook_url: '#',
          instagram_url: '#',
          twitter_url: '#',
          whatsapp_number: '',
          header_logo_url: '',
          footer_logo_url: '',
          dinosaurs_banner_url: '/products/dinosaur.svg',
          balloons_banner_url: '/products/balloon-k.svg',
          ...fetchedSettings
        }
        setSettings(defaultSettings)
        setOriginalSettings(defaultSettings)
      } else {
        throw new Error(data.message || 'Failed to fetch settings')
      }
    } catch (err: any) {
      console.error('Failed to fetch settings:', err)
      setError(err.message || 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess('Settings saved successfully')
        setOriginalSettings({ ...settings })
        refreshSettings() // Refresh global settings
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error(data.message || 'Failed to save settings')
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'header' | 'footer' | 'dinosaurs' | 'balloons') => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (type === 'header') {
          setSettings(prev => ({ ...prev, header_logo_url: data.data.url }))
        } else if (type === 'footer') {
          setSettings(prev => ({ ...prev, footer_logo_url: data.data.url }))
        } else if (type === 'dinosaurs') {
          setSettings(prev => ({ ...prev, dinosaurs_banner_url: data.data.url }))
        } else if (type === 'balloons') {
          setSettings(prev => ({ ...prev, balloons_banner_url: data.data.url }))
        }
      } else {
        throw new Error(data.message || 'Failed to upload image')
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      alert(err.message || 'Failed to upload image')
    }
  }

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const hasChanges = () => {
    if (!originalSettings) return false
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }

  const isFieldChanged = (field: keyof Settings) => {
    if (!originalSettings) return false
    return settings[field] !== originalSettings[field]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your store settings and preferences</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Store Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="store_name" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                id="store_name"
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isFieldChanged('store_name') ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="store_email" className="block text-sm font-medium text-gray-700 mb-1">
                Store Email
              </label>
              <input
                type="email"
                id="store_email"
                value={settings.store_email}
                onChange={(e) => handleChange('store_email', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isFieldChanged('store_email') ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="store_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Store Phone
              </label>
              <input
                type="tel"
                id="store_phone"
                value={settings.store_phone}
                onChange={(e) => handleChange('store_phone', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isFieldChanged('store_phone') ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                id="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isFieldChanged('whatsapp_number') ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="store_address" className="block text-sm font-medium text-gray-700 mb-1">
              Store Address
            </label>
            <textarea
              id="store_address"
              rows={3}
              value={settings.store_address}
              onChange={(e) => handleChange('store_address', e.target.value)}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                isFieldChanged('store_address') ? 'border-indigo-500 bg-indigo-50' : ''
              }`}
            />
          </div>
        </div>

        {/* Logo Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Logo Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Header Logo
              </label>
              <div className="mt-1">
                {settings.header_logo_url ? (
                  <div className="space-y-2">
                    <img
                      src={settings.header_logo_url}
                      alt="Header Logo"
                      className="h-16 w-auto max-w-xs object-contain border border-gray-200 rounded-md p-2"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'header')
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'header')
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Upload logo for header (recommended: 200x50px)</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Logo
              </label>
              <div className="mt-1">
                {settings.footer_logo_url ? (
                  <div className="space-y-2">
                    <img
                      src={settings.footer_logo_url}
                      alt="Footer Logo"
                      className="h-16 w-auto max-w-xs object-contain border border-gray-200 rounded-md p-2"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'footer')
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'footer')
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Upload logo for footer (recommended: 200x50px)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Banner Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Banner Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dinosaurs Banner
              </label>
              <div className="mt-1">
                {settings.dinosaurs_banner_url ? (
                  <div className="space-y-2">
                    <img
                      src={settings.dinosaurs_banner_url}
                      alt="Dinosaurs Banner"
                      className="h-24 w-full max-w-md object-cover border border-gray-200 rounded-md"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'dinosaurs')
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'dinosaurs')
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Upload banner for dinosaurs category (recommended: 600x300px)</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Balloons Banner
              </label>
              <div className="mt-1">
                {settings.balloons_banner_url ? (
                  <div className="space-y-2">
                    <img
                      src={settings.balloons_banner_url}
                      alt="Balloons Banner"
                      className="h-24 w-full max-w-md object-cover border border-gray-200 rounded-md"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'balloons')
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'balloons')
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Upload banner for balloons category (recommended: 600x300px)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Social Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                id="facebook_url"
                value={settings.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isFieldChanged('facebook_url') ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                id="instagram_url"
                value={settings.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isFieldChanged('instagram_url') ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter URL
              </label>
              <input
                type="url"
                id="twitter_url"
                value={settings.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isFieldChanged('twitter_url') ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!hasChanges() || saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettingsPage
