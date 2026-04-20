import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './admin/components/auth/LoginPage';
import Layout from './admin/components/Layout';
import RiderHomePage from './rider/pages/RiderHomePage';
import RiderDeliveriesPage from './rider/pages/RiderDeliveriesPage';
import RiderDeliveryDeliveredPage from './rider/pages/RiderDeliveryDeliveredPage';
import RiderDeliveryDetailsPage from './rider/pages/RiderDeliveryDetailsPage';
import RiderDeliveryPaymentPage from './rider/pages/RiderDeliveryPaymentPage';
import RiderHistoryDetailsPage from './rider/pages/RiderHistoryDetailsPage';
import RiderHistoryPage from './rider/pages/RiderHistoryPage';
import RiderLoginPage from './rider/pages/RiderLoginPage';
import RiderProfilePage from './rider/pages/RiderProfilePage';
import RiderSignupPage from './rider/pages/RiderSignupPage';
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
        <Route path="/rider/home" element={<RiderHomePage />} />
        <Route path="/rider/deliveries" element={<RiderDeliveriesPage />} />
        <Route path="/rider/deliveries/details" element={<RiderDeliveryDetailsPage />} />
        <Route path="/rider/deliveries/payment" element={<RiderDeliveryPaymentPage />} />
        <Route path="/rider/deliveries/delivered" element={<RiderDeliveryDeliveredPage />} />
        <Route path="/rider/history" element={<RiderHistoryPage />} />
        <Route path="/rider/history/details" element={<RiderHistoryDetailsPage />} />
        <Route path="/rider/profile" element={<RiderProfilePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
