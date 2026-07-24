import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './pages/Landing';
import CategoryPage from './pages/CategoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CartPage from './pages/CartPage';
import ProductDetail from './pages/ProductDetail';
import PaymentPage from './pages/PaymentPage';
import ProdukUnggulan from './pages/ProdukUnggulan';
import CheckoutPage from './pages/CheckoutPage';
import Setup2FA from './pages/Setup2FA';
import Verify2FA from './pages/Verify2FA';
// ❌ TwoFactorGuard DIHAPUS — tidak perlu, Login.jsx sudah urus 2FA sendiri

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/unggulan" element={<ProdukUnggulan />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          <Route path="/setup-2fa" element={<Setup2FA />} />
          <Route path="/verify-2fa" element={<Verify2FA />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-500">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;