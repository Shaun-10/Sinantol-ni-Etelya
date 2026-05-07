import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './admin/components/auth/AdminLoginPage';
import Layout from './admin/components/AdminLayout';
import AdminProtectedRoute from './admin/components/auth/AdminProtectedRoute';
import RiderProtectedRoute from './rider/components/RiderProtectedRoute';

const Dashboard = lazy(() => import('./admin/pages/DashboardPage'));
const OrdersPage = lazy(() => import('./admin/pages/OrdersPage'));
const RidersPage = lazy(() => import('./admin/pages/RidersPage'));
const SalesPage = lazy(() => import('./admin/pages/SalesPage'));

const RiderHomePage = lazy(() => import('./rider/pages/dashboard/RiderHomePage'));
const RiderDeliveriesPage = lazy(() => import('./rider/pages/deliveries/RiderDeliveriesPage'));
const RiderDeliveryDeliveredPage = lazy(() => import('./rider/pages/deliveries/RiderDeliveryDeliveredPage'));
const RiderDeliveryDetailsPage = lazy(() => import('./rider/pages/deliveries/RiderDeliveryDetailsPage'));
const RiderDeliveryPaymentPage = lazy(() => import('./rider/pages/deliveries/RiderDeliveryPaymentPage'));
const RiderHistoryDetailsPage = lazy(() => import('./rider/pages/history/RiderHistoryDetailsPage'));
const RiderHistoryPage = lazy(() => import('./rider/pages/history/RiderHistoryPage'));
const RiderLoginPage = lazy(() => import('./rider/pages/auth/RiderLoginPage'));
const RiderProfilePage = lazy(() => import('./rider/pages/profile/RiderProfilePage'));
const RiderSignupPage = lazy(() => import('./rider/pages/auth/RiderSignupPage'));
const RiderMapPage = lazy(() => import('./rider/pages/navigation/RiderMapPage'));
const RiderAreaRoutesPage = lazy(() => import('./rider/pages/navigation/RiderAreaRoutesPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AdminProtectedRoute><Layout /></AdminProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/riders" element={<RidersPage />} />
        <Route path="/sales" element={<SalesPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/rider" element={<Navigate to="/rider/login" replace />} />
      <Route path="/rider/login" element={<RiderLoginPage />} />
      <Route path="/rider/signup" element={<RiderSignupPage />} />
      <Route path="/rider/home" element={<RiderProtectedRoute><RiderHomePage /></RiderProtectedRoute>} />
      <Route path="/rider/deliveries" element={<RiderProtectedRoute><RiderDeliveriesPage /></RiderProtectedRoute>} />
      <Route path="/rider/deliveries/details" element={<RiderProtectedRoute><RiderDeliveryDetailsPage /></RiderProtectedRoute>} />
      <Route path="/rider/deliveries/payment" element={<RiderProtectedRoute><RiderDeliveryPaymentPage /></RiderProtectedRoute>} />
      <Route path="/rider/deliveries/delivered" element={<RiderProtectedRoute><RiderDeliveryDeliveredPage /></RiderProtectedRoute>} />
      <Route path="/rider/history" element={<RiderProtectedRoute><RiderHistoryPage /></RiderProtectedRoute>} />
      <Route path="/rider/history/details" element={<RiderProtectedRoute><RiderHistoryDetailsPage /></RiderProtectedRoute>} />
      <Route path="/rider/profile" element={<RiderProtectedRoute><RiderProfilePage /></RiderProtectedRoute>} />
      <Route path="/rider/routes" element={<RiderProtectedRoute><RiderAreaRoutesPage /></RiderProtectedRoute>} />
      <Route path="/rider/map" element={<RiderProtectedRoute><RiderMapPage /></RiderProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
