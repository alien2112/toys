const API_BASE_URL = 'http://localhost:8080/api';

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

  async addToCart(data: { product_id: number; quantity: number; variant_id?: number }) {
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

  // Product endpoints
  async getFeaturedProducts(limit: number = 4): Promise<any> {
    return this.request(`/products/featured?limit=${limit}`);
  }

  async getTopRatedProducts(limit: number = 4): Promise<any> {
    return this.request(`/products/top-rated?limit=${limit}`);
  }

  async getProductVariants(productId: number): Promise<any> {
    return this.request(`/products/${productId}/variants`);
  }

  // Category endpoints
  async getCategories(): Promise<any> {
    return this.request('/categories');
  }

  async getCategoryById(id: number): Promise<any> {
    return this.request(`/categories/${id}`);
  }

  async searchCategories(query: string): Promise<any> {
    return this.request(`/categories/search?q=${encodeURIComponent(query)}`);
  }

  async createCategory(data: { name: string; slug: string; description?: string }): Promise<any> {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: { name: string; slug: string; description?: string }): Promise<any> {
    return this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<any> {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings endpoints
  async getSettings(): Promise<any> {
    return this.request('/settings');
  }

  async updateSettings(data: any): Promise<any> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin Dashboard
  async getDashboardStats(): Promise<any> {
    return this.request('/admin/dashboard');
  }

  // Admin Orders
  async getAllOrders(params?: { status?: string; page?: number; limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = queryParams.toString() ? `/admin/orders?${queryParams}` : '/admin/orders';
    return this.request(url);
  }

  async updateOrderStatus(orderId: number, status: string, notes?: string): Promise<any> {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getOrderStatusHistory(orderId: number): Promise<any> {
    return this.request(`/admin/orders/${orderId}/status-history`);
  }

  async getOrderDetails(orderId: number): Promise<any> {
    return this.request(`/orders/${orderId}/details`);
  }

  // Admin Users
  async getAllUsers(params?: { page?: number; limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = queryParams.toString() ? `/admin/users?${queryParams}` : '/admin/users';
    return this.request(url);
  }

  async updateUserRole(userId: number, role: string): Promise<any> {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // Wishlist endpoints
  async getWishlist(): Promise<any> {
    return this.request('/wishlist');
  }

  async addToWishlist(productId: number): Promise<any> {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeFromWishlist(productId: number): Promise<any> {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async toggleStockAlert(productId: number, enabled: boolean): Promise<any> {
    return this.request(`/wishlist/${productId}/stock-alert`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  async updateWishlistSharing(isPublic: boolean): Promise<any> {
    return this.request('/wishlist/sharing', {
      method: 'PUT',
      body: JSON.stringify({ is_public: isPublic }),
    });
  }

  // Support/Contact endpoints
  async createSupportTicket(data: {
    subject: string;
    message: string;
    email: string;
    name: string;
    phone?: string;
    category?: string;
  }): Promise<any> {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSupportTickets(): Promise<any> {
    return this.request('/support/tickets');
  }

  async getSupportTicket(id: number): Promise<any> {
    return this.request(`/support/tickets/${id}`);
  }

  // Upload endpoints
  async uploadProductImage(formData: FormData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/upload/product`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: formData,
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.data;
  }

  async uploadCategoryImage(formData: FormData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/upload/category`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: formData,
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.data;
  }

  async deleteImage(imagePath: string): Promise<any> {
    return this.request('/upload', {
      method: 'DELETE',
      body: JSON.stringify({ image_path: imagePath }),
    });
  }

  // Analytics endpoints
  async trackEvent(eventType: string, eventData: any): Promise<any> {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event_type: eventType, event_data: eventData }),
    });
  }

  async getSalesAnalytics(params?: { start_date?: string; end_date?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const url = queryParams.toString() ? `/admin/analytics/sales?${queryParams}` : '/admin/analytics/sales';
    return this.request(url);
  }

  async getCustomerBehaviorAnalytics(): Promise<any> {
    return this.request('/admin/analytics/customer-behavior');
  }

  async getInventoryAnalytics(): Promise<any> {
    return this.request('/admin/analytics/inventory');
  }

  async getCROAnalytics(): Promise<any> {
    return this.request('/admin/analytics/cro');
  }

  // Inventory endpoints
  async getLowStockAlerts(): Promise<any> {
    return this.request('/admin/inventory/low-stock');
  }

  async getInventoryMovements(productId: number): Promise<any> {
    return this.request(`/admin/inventory/movements/${productId}`);
  }

  async batchUpdateInventory(updates: any[]): Promise<any> {
    return this.request('/admin/inventory/batch-update', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }
}

export const apiService = new ApiService();
