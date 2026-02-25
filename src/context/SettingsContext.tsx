import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

interface SettingsContextValue {
  settings: Settings
  loading: boolean
  refreshSettings: () => void
}

const defaultSettings: Settings = {
  store_name: 'AMANLOVE',
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
  balloons_banner_url: '/products/balloon-k.svg'
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/settings')
      const data = await response.json()
      
      if (data.success) {
        const fetchedSettings = data.data.settings || {}
        setSettings({
          ...defaultSettings,
          ...fetchedSettings
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = () => {
    setLoading(true)
    fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const value = {
    settings,
    loading,
    refreshSettings
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
