import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { apiService } from '../services/api'

interface AnalyticsEvent {
  event_type: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_started' | 'purchase_completed' | 'search' | 'category_view' | 'cart_abandoned'
  event_data?: Record<string, any>
  user_id?: number
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void
  trackPageView: (page: string) => void
  trackProductView: (productId: number, productName: string) => void
  trackAddToCart: (productId: number, productName: string, quantity: number, price: number) => void
  trackCheckoutStarted: (cartValue: number, itemCount: number) => void
  trackPurchaseCompleted: (orderId: number, totalAmount: number, itemCount: number) => void
  trackSearch: (query: string, resultCount: number) => void
  trackCategoryView: (categoryId: number, categoryName: string) => void
  trackCartAbandoned: (cartValue: number, itemCount: number) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

const SESSION_STORAGE_KEY = 'analytics_session_id'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
    const lastActivity = sessionStorage.getItem('analytics_last_activity')
    const now = Date.now()
    
    if (!sessionId || !lastActivity || (now - parseInt(lastActivity)) > SESSION_TIMEOUT) {
      sessionId = generateSessionId()
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    }
    
    sessionStorage.setItem('analytics_last_activity', now.toString())
    return sessionId
  }

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const getUserId = (): number | undefined => {
    try {
      const userData = localStorage.getItem('amanlove_user')
      if (userData) {
        const user = JSON.parse(userData)
        return user.id
      }
    } catch (error) {
      console.warn('Failed to get user ID from storage:', error)
    }
    return undefined
  }

  const trackEvent = (event: AnalyticsEvent) => {
    try {
      const sessionId = getSessionId()
      const userId = getUserId()
      
      const eventData = {
        session_id: sessionId,
        user_id: userId,
        event_type: event.event_type,
        event_data: event.event_data || {},
        timestamp: new Date().toISOString()
      }

      // Send to backend (non-blocking)
      apiService.post('/analytics/track', eventData).catch((error: any) => {
        console.warn('Failed to track analytics event:', error)
      })

      // Store in session for offline tracking (optional)
      const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]')
      events.push(eventData)
      
      // Keep only last 100 events in session storage
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }
      
      sessionStorage.setItem('analytics_events', JSON.stringify(events))
    } catch (error) {
      console.warn('Analytics tracking error:', error)
    }
  }

  const trackPageView = (page: string) => {
    trackEvent({
      event_type: 'page_view',
      event_data: {
        page,
        url: window.location.href,
        title: document.title,
        referrer: document.referrer
      }
    })
  }

  const trackProductView = (productId: number, productName: string) => {
    trackEvent({
      event_type: 'product_view',
      event_data: {
        product_id: productId,
        product_name: productName,
        url: window.location.href
      }
    })
  }

  const trackAddToCart = (productId: number, productName: string, quantity: number, price: number) => {
    trackEvent({
      event_type: 'add_to_cart',
      event_data: {
        product_id: productId,
        product_name: productName,
        quantity,
        price,
        total_value: quantity * price
      }
    })
  }

  const trackCheckoutStarted = (cartValue: number, itemCount: number) => {
    trackEvent({
      event_type: 'checkout_started',
      event_data: {
        cart_value: cartValue,
        item_count: itemCount,
        currency: 'KWD' // Assuming KWD for Kuwait
      }
    })
  }

  const trackPurchaseCompleted = (orderId: number, totalAmount: number, itemCount: number) => {
    trackEvent({
      event_type: 'purchase_completed',
      event_data: {
        order_id: orderId,
        total_amount: totalAmount,
        item_count: itemCount,
        currency: 'KWD'
      }
    })
  }

  const trackSearch = (query: string, resultCount: number) => {
    trackEvent({
      event_type: 'search',
      event_data: {
        query,
        result_count: resultCount
      }
    })
  }

  const trackCategoryView = (categoryId: number, categoryName: string) => {
    trackEvent({
      event_type: 'category_view',
      event_data: {
        category_id: categoryId,
        category_name: categoryName
      }
    })
  }

  const trackCartAbandoned = (cartValue: number, itemCount: number) => {
    trackEvent({
      event_type: 'cart_abandoned',
      event_data: {
        cart_value: cartValue,
        item_count: itemCount,
        currency: 'KWD'
      }
    })
  }

  // Auto-track page views
  useEffect(() => {
    const handlePageView = () => {
      const path = window.location.pathname
      trackPageView(path)
    }

    // Track initial page view
    handlePageView()

    // Track page view on navigation (for SPA)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      setTimeout(handlePageView, 0)
    }
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(handlePageView, 0)
    }

    // Track page view on popstate (browser back/forward)
    window.addEventListener('popstate', handlePageView)

    // Track cart abandonment on page unload
    const handleBeforeUnload = () => {
      try {
        const cartData = localStorage.getItem('cart')
        if (cartData) {
          const cart = JSON.parse(cartData)
          if (cart.items && cart.items.length > 0) {
            const cartValue = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
            const itemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
            trackCartAbandoned(cartValue, itemCount)
          }
        }
      } catch (error) {
        // Ignore errors during page unload
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
      window.removeEventListener('popstate', handlePageView)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackCheckoutStarted,
    trackPurchaseCompleted,
    trackSearch,
    trackCategoryView,
    trackCartAbandoned
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}
