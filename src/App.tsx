import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { DemoLogin } from './components/DemoLogin';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { PickupPage } from './pages/PickupPage';
import { PickerDashboardPage } from './pages/PickerDashboardPage';
import { B2BCatalogPage } from './pages/B2BCatalogPage';
import { B2BCheckoutPage } from './pages/B2BCheckoutPage';
import { SupplierBookingPage } from './pages/SupplierBookingPage';
import { SecurityDashboardPage } from './pages/SecurityDashboardPage';
import { VetDashboardPage } from './pages/VetDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <DemoLogin />
        </PublicRoute>
      } />

      {/* Protected routes with layout */}
      <Route element={
        <ProtectedRoute allowedRoles={[]}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:id/success" element={<OrderSuccessPage />} />
        <Route path="/pickup/:orderId" element={<PickupPage />} />
        
        {/* Picker */}
        <Route path="/picker" element={
          <ProtectedRoute allowedRoles={['picker']}>
            <PickerDashboardPage />
          </ProtectedRoute>
        } />

        {/* B2B */}
        <Route path="/b2b" element={
          <ProtectedRoute allowedRoles={['wholesaler']}>
            <B2BCatalogPage />
          </ProtectedRoute>
        } />
        <Route path="/b2b/checkout" element={
          <ProtectedRoute allowedRoles={['wholesaler']}>
            <B2BCheckoutPage />
          </ProtectedRoute>
        } />

        {/* Supplier */}
        <Route path="/supplier" element={
          <ProtectedRoute allowedRoles={['supplier']}>
            <SupplierBookingPage />
          </ProtectedRoute>
        } />

        {/* Security */}
        <Route path="/security" element={
          <ProtectedRoute allowedRoles={['security']}>
            <SecurityDashboardPage />
          </ProtectedRoute>
        } />

        {/* Vet */}
        <Route path="/vet" element={
          <ProtectedRoute allowedRoles={['vet']}>
            <VetDashboardPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}