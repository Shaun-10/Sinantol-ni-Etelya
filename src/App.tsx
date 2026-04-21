import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './admin/components/auth/LoginPage';
import Layout from './admin/components/Layout';
import RiderHomePage from './rider/pages/dashboard/RiderHomePage';
import RiderDeliveriesPage from './rider/pages/deliveries/RiderDeliveriesPage';
import RiderDeliveryDeliveredPage from './rider/pages/deliveries/RiderDeliveryDeliveredPage';
import RiderDeliveryDetailsPage from './rider/pages/deliveries/RiderDeliveryDetailsPage';
import RiderDeliveryPaymentPage from './rider/pages/deliveries/RiderDeliveryPaymentPage';
import RiderHistoryDetailsPage from './rider/pages/history/RiderHistoryDetailsPage';
import RiderHistoryPage from './rider/pages/history/RiderHistoryPage';
import RiderLoginPage from './rider/pages/auth/RiderLoginPage';
import RiderProfilePage from './rider/pages/profile/RiderProfilePage';
import RiderSignupPage from './rider/pages/auth/RiderSignupPage';
import RiderProtectedRoute from './rider/components/RiderProtectedRoute';
import RiderMapPage from './rider/pages/navigation/RiderMapPage';
import RiderAreaRoutesPage from './rider/pages/navigation/RiderAreaRoutesPage';
import Dashboard from './admin/pages/Dashboard';
import OrdersPage from './admin/pages/OrdersPage';
import RidersPage from './admin/pages/RidersPage';
import SalesPage from './admin/pages/SalesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<Layout />}>
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
    </BrowserRouter>
  );
}
