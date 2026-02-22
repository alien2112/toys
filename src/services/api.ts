const API_BASE_URL = 'http://localhost:8002/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Request failed');
    }

    return data.data as T;
  }

  async getProducts(params?: {
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = queryParams.toString() ? `/products?${queryParams}` : '/products';
    return this.request(url);
  }

  async getSearchSuggestions(query: string, limit: number = 5): Promise<any[]> {
    return this.request(`/products/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getPopularSearches(limit: number = 10): Promise<any[]> {
    return this.request(`/products/search/popular?limit=${limit}`);
  }

  async getProduct(id: string | number) {
    return this.request<any>(`/products/${id}`);
  }

  async getProductReviews(productId: string | number) {
    return this.request<any>(`/products/${productId}/reviews`);
  }

  async createReview(data: { product_id: number; rating: number; comment?: string }) {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    return this.request<any>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const result = await this.request<any>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }
    return result;
  }

  async getCart(userId: number) {
    return this.request<any>(`/cart/${userId}`);
  }

  async addToCart(data: { product_id: number; quantity: number }) {
    return this.request<any>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(cartItemId: number, quantity: number) {
    return this.request<any>(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(cartItemId: number) {
    return this.request<any>(`/cart/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request<any>('/cart', {
      method: 'DELETE',
    });
  }

  async createOrder(data: {
    items: Array<{ product_id: number; quantity: number; price: number }>;
    shipping_address: string;
  }) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserOrders(userId: number) {
    return this.request<any>(`/orders/${userId}`);
  }

  async createPayment(data: {
    order_id: number;
    gateway: string;
  }) {
    return this.request<any>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(paymentId: number) {
    return this.request<any>(`/payments/${paymentId}`);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
