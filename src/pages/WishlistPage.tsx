import React, { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Trash2, AlertCircle, Share2, Bell, BellOff, Users, Link } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { apiService } from '../services/api'
import './WishlistPage.css'

interface WishlistItem {
  id: number
  product_id: number
  name: string
  price: number
  image_url: string
  stock: number
  is_active: boolean
  added_at: string
  stock_alert: boolean
  product_slug?: string
}

interface Wishlist {
  id: number
  name: string
  slug?: string
  is_public: boolean
  share_token?: string
  created_at: string
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiService.get('/wishlist')
        
        if ((response as any).success) {
          setWishlist((response as any).data.wishlist)
          setWishlistItems((response as any).data.items || [])
        } else {
          setError('فشل في تحميل قائمة المفضلة')
        }
      } catch (err) {
        console.error('Error loading wishlist:', err)
        setError('فشل في تحميل قائمة المفضلة')
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [user])

  const handleRemove = async (productId: number) => {
    if (!user) return

    try {
      const response = await apiService.delete(`/wishlist/${productId}`)
      
      if ((response as any).success) {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId))
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      setError('فشل في إزالة المنتج من المفضلة')
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.product_id,
      name: item.name,
      price: item.price,
      image: item.image_url,
      category: ''
    })
  }

  const handleToggleStockAlert = async (productId: number) => {
    if (!user) return

    try {
      const response = await apiService.put(`/wishlist/${productId}/stock-alert`)
      
      if ((response as any).success) {
        setWishlistItems(prev => prev.map(item => 
          item.product_id === productId 
            ? { ...item, stock_alert: !item.stock_alert }
            : item
        ))
      }
    } catch (err) {
      console.error('Error toggling stock alert:', err)
      setError('فشل في تحديث تنبيه المخزون')
    }
  }

  const handleShare = async () => {
    if (!wishlist) return

    try {
      // Make wishlist public if not already
      if (!wishlist.is_public) {
        const response = await apiService.put('/wishlist/sharing', {
          is_public: true,
          name: wishlist.name
        })
        
        if ((response as any).success) {
          setWishlist((response as any).data)
        }
      }

      const shareToken = wishlist.share_token || ''
      const url = `${window.location.origin}/wishlist/share/${shareToken}`
      setShareUrl(url)
      setShowShareDialog(true)
    } catch (err) {
      console.error('Error sharing wishlist:', err)
      setError('فشل في مشاركة قائمة المفضلة')
    }
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    setShowShareDialog(false)
  }

  if (!user) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <Heart size={40} />
            <h1 className="wishlist-title">قائمة المفضلة</h1>
            <p className="wishlist-subtitle">يرجى تسجيل الدخول لعرض قائمة المفضلة</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <Heart size={40} />
            <h1 className="wishlist-title">قائمة المفضلة</h1>
            <p className="wishlist-subtitle">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <Heart size={40} />
            <h1 className="wishlist-title">قائمة المفضلة</h1>
            <p className="wishlist-subtitle">المنتجات المفضلة لديك</p>
          </div>
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <Heart size={40} />
            <h1 className="wishlist-title">قائمة المفضلة</h1>
            <p className="wishlist-subtitle">لا توجد منتجات في قائمة المفضلة</p>
          </div>
          <div className="empty-wishlist">
            <Heart size={80} />
            <h3>قائمة المفضلة فارغة</h3>
            <p>ابدأ بإضافة منتجاتك المفضلة لتجدها هنا!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <Heart size={40} />
          <h1 className="wishlist-title">قائمة المفضلة</h1>
          <p className="wishlist-subtitle">
            {wishlistItems.length} منتجات في قائمتك
          </p>
          <button 
            className="share-button"
            onClick={handleShare}
            title="مشاركة قائمة المفضلة"
          >
            <Share2 size={20} />
            مشاركة
          </button>
        </div>

        <div className="wishlist-grid">
          {wishlistItems.map(item => {
            const inStock = item.is_active && item.stock > 0
            return (
              <div key={item.id} className="wishlist-card">
                <button 
                  className="remove-button"
                  onClick={() => handleRemove(item.product_id)}
                  aria-label="إزالة من المفضلة"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="wishlist-image">
                  <img src={item.image_url} alt={item.name} />
                </div>

                <div className="wishlist-info">
                  <h3 className="wishlist-item-name">{item.name}</h3>
                  <div className="wishlist-price">
                    <span className="price-amount">{item.price.toFixed(2)} ر.س</span>
                    {!inStock && (
                      <span className="out-of-stock">غير متوفر</span>
                    )}
                  </div>
                </div>

                <div className="wishlist-actions">
                  <button 
                    className="stock-alert-button"
                    onClick={() => handleToggleStockAlert(item.product_id)}
                    title={item.stock_alert ? "إيقاف التنبيه" : "تنبيه عند التوفر"}
                  >
                    {item.stock_alert ? <BellOff size={16} /> : <Bell size={16} />}
                  </button>
                  
                  <button 
                    className="add-to-cart-button"
                    disabled={!inStock}
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart size={18} />
                    {inStock ? 'أضف للسلة' : 'غير متوفر'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="share-dialog-overlay" onClick={() => setShowShareDialog(false)}>
          <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>مشاركة قائمة المفضلة</h3>
            <p>شارك قائمة المفضلة الخاصة بك مع الآخرين</p>
            <div className="share-url-container">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="share-url-input"
              />
              <button 
                className="copy-button"
                onClick={copyShareUrl}
              >
                <Link size={16} />
                نسخ الرابط
              </button>
            </div>
            <button 
              className="close-button"
              onClick={() => setShowShareDialog(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WishlistPage
