import React, { createContext, useContext, useReducer, useMemo, ReactNode, useEffect } from 'react'
import { CartState, CartAction, Product, CartItem } from '../types/cart.types'
import { useAuth } from './AuthContext'
import { apiService } from '../services/api'

const CART_STORAGE_KEY = 'amanlove_cart'

const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      return JSON.parse(savedCart)
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error)
  }
  return { items: [] }
}

const saveCartToStorage = (state: CartState) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

const initialState: CartState = { items: [] }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState

  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id)

      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
        }
      }
      break
    }

    case 'REMOVE_FROM_CART':
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      }
      break

    case 'INCREASE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }
      break

    case 'DECREASE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      }
      break

    case 'CLEAR_CART':
      newState = { items: [] }
      break

    case 'SET_CART':
      newState = { items: action.payload }
      break

    default:
      newState = state
  }

  return newState
}

interface CartContextValue {
  state: CartState
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  increaseQuantity: (productId: number) => void
  decreaseQuantity: (productId: number) => void
  clearCart: () => void
  subtotal: number
  totalItems: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { isAuthenticated, user } = useAuth()

  // Sync with backend on auth state changes
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && user) {
        // User just logged in, merge guest cart with server cart
        try {
          // Fetch server cart
          const serverCart = await apiService.getCart(user.id)
          const serverItems = serverCart.items || []

          // Get local guest cart
          const localCart = loadCartFromStorage()
          
          if (localCart.items.length > 0) {
            // Merge local items into server cart
            for (const localItem of localCart.items) {
              try {
                await apiService.addToCart({
                  product_id: localItem.id,
                  quantity: localItem.quantity
                })
              } catch (error) {
                console.error('Failed to sync item to server:', error)
              }
            }
            
            // Clear local cart after merge
            localStorage.removeItem(CART_STORAGE_KEY)
          }

          // Set state from server cart
          const mappedItems: CartItem[] = serverItems.map((item: any) => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image_url,
            category: item.category_name || '',
            quantity: item.quantity,
            cartItemId: item.id
          }))
          
          dispatch({ type: 'SET_CART', payload: mappedItems })
        } catch (error) {
          console.error('Failed to sync cart with server:', error)
          // Fallback to local cart if server sync fails
          const localCart = loadCartFromStorage()
          dispatch({ type: 'SET_CART', payload: localCart.items })
        }
      } else if (!isAuthenticated) {
        // User logged out, clear server cart reference and use local cart
        dispatch({ type: 'CLEAR_CART' })
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    }

    syncCart()
  }, [isAuthenticated, user])

  const addToCart = async (product: Product) => {
    if (isAuthenticated && user) {
      try {
        // Add to server cart first
        await apiService.addToCart({
          product_id: product.id,
          quantity: 1
        })
        
        dispatch({ type: 'ADD_TO_CART', payload: product })
      } catch (error) {
        console.error('Failed to add to server cart:', error)
        // Fallback to local-only update
        dispatch({ type: 'ADD_TO_CART', payload: product })
      }
    } else {
      // Guest mode - use local storage only
      dispatch({ type: 'ADD_TO_CART', payload: product })
    }
  }

  const removeFromCart = async (productId: number) => {
    const item = state.items.find(item => item.id === productId)
    
    if (isAuthenticated && user && item?.cartItemId) {
      try {
        // Remove from server cart
        await apiService.removeCartItem(item.cartItemId)
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId })
      } catch (error) {
        console.error('Failed to remove from server cart:', error)
        // Still remove from local state
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId })
      }
    } else {
      // Guest mode or no cartItemId
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId })
    }
  }

  const increaseQuantity = async (productId: number) => {
    const item = state.items.find(item => item.id === productId)
    
    if (isAuthenticated && user && item?.cartItemId) {
      try {
        // Update on server
        const newQuantity = item.quantity + 1
        await apiService.updateCartItem(item.cartItemId, newQuantity)
        dispatch({ type: 'INCREASE_QUANTITY', payload: productId })
      } catch (error) {
        console.error('Failed to update server cart:', error)
        // Still update local state
        dispatch({ type: 'INCREASE_QUANTITY', payload: productId })
      }
    } else {
      // Guest mode or no cartItemId
      dispatch({ type: 'INCREASE_QUANTITY', payload: productId })
    }
  }

  const decreaseQuantity = async (productId: number) => {
    const item = state.items.find(item => item.id === productId)
    
    if (item && item.quantity > 1) {
      if (isAuthenticated && user && item?.cartItemId) {
        try {
          // Update on server
          const newQuantity = item.quantity - 1
          await apiService.updateCartItem(item.cartItemId, newQuantity)
          dispatch({ type: 'DECREASE_QUANTITY', payload: productId })
        } catch (error) {
          console.error('Failed to update server cart:', error)
          // Still update local state
          dispatch({ type: 'DECREASE_QUANTITY', payload: productId })
        }
      } else {
        // Guest mode or no cartItemId
        dispatch({ type: 'DECREASE_QUANTITY', payload: productId })
      }
    }
  }

  const clearCart = async () => {
    if (isAuthenticated && user) {
      try {
        // Clear server cart
        await apiService.clearCart()
      } catch (error) {
        console.error('Failed to clear server cart:', error)
      }
    }
    
    // Always clear local state
    dispatch({ type: 'CLEAR_CART' })
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  // Save to localStorage for guest mode
  useEffect(() => {
    if (!isAuthenticated) {
      saveCartToStorage(state)
    }
  }, [state, isAuthenticated])

  const subtotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items]
  )

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  )

  const value = useMemo(
    () => ({
      state,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      subtotal,
      totalItems,
    }),
    [state, subtotal, totalItems]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
