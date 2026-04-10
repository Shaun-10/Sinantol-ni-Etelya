import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import Layout from './components/Layout';
import RiderHomePage from './pages/RiderHomePage';
import RiderDeliveriesPage from './pages/RiderDeliveriesPage';
import RiderDeliveryDeliveredPage from './pages/RiderDeliveryDeliveredPage';
import RiderDeliveryDetailsPage from './pages/RiderDeliveryDetailsPage';
import RiderDeliveryPaymentPage from './pages/RiderDeliveryPaymentPage';
import RiderHistoryDetailsPage from './pages/RiderHistoryDetailsPage';
import RiderHistoryPage from './pages/RiderHistoryPage';
import RiderLoginPage from './pages/RiderLoginPage';
import RiderProfilePage from './pages/RiderProfilePage';
import RiderSignupPage from './pages/RiderSignupPage';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import RidersPage from './pages/RidersPage';
import SalesPage from './pages/SalesPage';

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
