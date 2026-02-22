export interface Product {
  id: number
  name: string
  price: number
  image: string
  images?: string[]
  category: string
}

export interface CartItem extends Product {
  quantity: number
  cartItemId?: number // Backend cart item ID for API operations
}

export interface CartState {
  items: CartItem[]
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'INCREASE_QUANTITY'; payload: number }
  | { type: 'DECREASE_QUANTITY'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }
