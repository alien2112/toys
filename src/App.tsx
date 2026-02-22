import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { AnalyticsProvider } from './context/AnalyticsContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import WishlistPage from './pages/WishlistPage'
import SettingsPage from './pages/SettingsPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentCancelPage from './pages/PaymentCancelPage'
import FAQPage from './pages/FAQPage'
import PolicyPage from './pages/PolicyPage'
import AdminRoute from './components/admin/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminLoginPage from './pages/admin/LoginPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminSettingsPage from './pages/admin/SettingsPage'
import AdminProductsPage from './pages/admin/ProductsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminSeederPage from './pages/admin/AdminSeederPage'
import AdminBlogsPage from './pages/admin/AdminBlogsPage'
import InventoryPage from './pages/admin/InventoryPage'
import SupportPage from './pages/admin/SupportPage'
import ChatManagementPage from './pages/admin/ChatManagementPage'

function App() {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Router>
              <div className="app">
                <Routes>
                {/* Auth Routes (no header/footer) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin routes with layout and guard */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<AdminDashboardPage />} />
                        <Route path="/analytics" element={<AdminAnalyticsPage />} />
                        <Route path="/products" element={<AdminProductsPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/categories" element={<AdminCategoriesPage />} />
                        <Route path="/blogs" element={<AdminBlogsPage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/chat" element={<ChatManagementPage />} />
                        <Route path="/seeder" element={<AdminSeederPage />} />
                        <Route path="/settings" element={<AdminSettingsPage />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                } />

                {/* Public Routes (with header/footer) */}
                <Route path="*" element={
                  <>
                    <Header />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:id" element={<BlogDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/payment/success" element={<PaymentSuccessPage />} />
                      <Route path="/payment/cancel" element={<PaymentCancelPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/policies" element={<PolicyPage />} />
                    </Routes>
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  </AnalyticsProvider>
  )
}

export default App
