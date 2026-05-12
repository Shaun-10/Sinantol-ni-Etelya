import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginPage from "./admin/components/auth/AdminLoginPage";
import Layout from "./admin/components/AdminLayout";
import AdminProtectedRoute from "./admin/components/auth/AdminProtectedRoute";
import RiderProtectedRoute from "./rider/components/RiderProtectedRoute";
import ResetPassword from "./admin/pages/ResetPassword";

const Dashboard = lazy(() => import("./admin/pages/DashboardPage"));
const OrdersPage = lazy(() => import("./admin/pages/OrdersPage"));
const RidersPage = lazy(() => import("./admin/pages/RidersPage"));
const SalesPage = lazy(() => import("./admin/pages/SalesPage"));

const RiderHomePage = lazy(
  () => import("./rider/pages/dashboard/RiderHomePage"),
);
const RiderDeliveriesPage = lazy(
  () => import("./rider/pages/deliveries/RiderDeliveriesPage"),
);
const RiderDeliveryDeliveredPage = lazy(
  () => import("./rider/pages/deliveries/RiderDeliveryDeliveredPage"),
);
const RiderDeliveryDetailsPage = lazy(
  () => import("./rider/pages/deliveries/RiderDeliveryDetailsPage"),
);
const RiderDeliveryPaymentPage = lazy(
  () => import("./rider/pages/deliveries/RiderDeliveryPaymentPage"),
);
const RiderHistoryDetailsPage = lazy(
  () => import("./rider/pages/history/RiderHistoryDetailsPage"),
);
const RiderHistoryPage = lazy(
  () => import("./rider/pages/history/RiderHistoryPage"),
);
const RiderLoginPage = lazy(() => import("./rider/pages/auth/RiderLoginPage"));
const RiderProfilePage = lazy(
  () => import("./rider/pages/profile/RiderProfilePage"),
);
// Rider signup removed — route redirects to login. Keeping import removed.
const RiderMapPage = lazy(
  () => import("./rider/pages/navigation/RiderMapPage"),
);
const RiderAreaRoutesPage = lazy(
  () => import("./rider/pages/navigation/RiderAreaRoutesPage"),
);

function hasPasswordRecoveryParams(search: string, hash: string): boolean {
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  return (
    searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery" ||
    (searchParams.has("code") && !searchParams.has("error")) ||
    (hashParams.has("access_token") && hashParams.has("refresh_token"))
  );
}

function PublicEntryRedirect() {
  const location = useLocation();

  if (hasPasswordRecoveryParams(location.search, location.hash)) {
    return (
      <Navigate
        to={`/reset-password${location.search}${location.hash}`}
        replace
      />
    );
  }

  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicEntryRedirect />} />

      <Route
        element={
          <AdminProtectedRoute>
            <Layout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/riders" element={<RidersPage />} />
        <Route path="/sales" element={<SalesPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/rider" element={<Navigate to="/rider/login" replace />} />
      <Route path="/rider/login" element={<RiderLoginPage />} />
      <Route
        path="/rider/signup"
        element={<Navigate to="/rider/login" replace />}
      />
      <Route
        path="/rider/home"
        element={
          <RiderProtectedRoute>
            <RiderHomePage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/deliveries"
        element={
          <RiderProtectedRoute>
            <RiderDeliveriesPage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/deliveries/details"
        element={
          <RiderProtectedRoute>
            <RiderDeliveryDetailsPage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/deliveries/payment"
        element={
          <RiderProtectedRoute>
            <RiderDeliveryPaymentPage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/deliveries/delivered"
        element={
          <RiderProtectedRoute>
            <RiderDeliveryDeliveredPage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/history"
        element={
          <RiderProtectedRoute>
            <RiderHistoryPage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/history/details"
        element={
          <RiderProtectedRoute>
            <RiderHistoryDetailsPage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/profile"
        element={
          <RiderProtectedRoute>
            <RiderProfilePage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/routes"
        element={
          <RiderProtectedRoute>
            <RiderAreaRoutesPage />
          </RiderProtectedRoute>
        }
      />
      <Route
        path="/rider/map"
        element={
          <RiderProtectedRoute>
            <RiderMapPage />
          </RiderProtectedRoute>
        }
      />
      <Route path="*" element={<PublicEntryRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={<div className="p-6 text-sm text-gray-600">Loading...</div>}
      >
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
