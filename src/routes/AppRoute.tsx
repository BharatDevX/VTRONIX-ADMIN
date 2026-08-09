import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "@/components/auth/LoginPage";
import AppLayout from "@/layouts/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

const AttendancePage = lazy(() => import("@/pages/AttendancePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const DealerPage = lazy(() => import("@/pages/DealerPage"));
const DealersPage = lazy(() => import("@/pages/DealersPage"));
const DoctorPage = lazy(() => import("@/pages/DoctorPage"));
const DoctorVisitsPage = lazy(() => import("@/pages/DoctorVisitPage"));
const EmployeesPage = lazy(() => import("@/pages/EmployeesPage"));
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"));
const MtpPage = lazy(() => import("@/pages/MtpPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const RetailersPage = lazy(() => import("@/pages/RetailersPage"));
const SalesPage = lazy(() => import("@/pages/SalesPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const TrackingPage = lazy(() => import("@/pages/TrackingPage"));

function RouteLoader() {
  return (
    <div className="space-y-5 p-5">
      <Skeleton className="h-24" />
      <Skeleton className="h-96" />
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<LazyPage><ForbiddenPage /></LazyPage>} path="/forbidden" />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<LazyPage><DashboardPage /></LazyPage>} index />
          <Route element={<LazyPage><EmployeesPage /></LazyPage>} path="employees" />
          <Route element={<LazyPage><AttendancePage /></LazyPage>} path="attendance" />
          <Route element={<LazyPage><DoctorPage /></LazyPage>} path="doctor" />
          <Route element={<LazyPage><DoctorVisitsPage /></LazyPage>} path="doctor-visits" />
          <Route element={<LazyPage><DealerPage /></LazyPage>} path="dealer" />
          <Route element={<LazyPage><DealersPage /></LazyPage>} path="dealers" />
          <Route element={<LazyPage><RetailersPage /></LazyPage>} path="retailers" />
          <Route element={<LazyPage><ProductsPage /></LazyPage>} path="products" />
          <Route element={<LazyPage><SalesPage /></LazyPage>} path="sales" />
          <Route element={<LazyPage><MtpPage /></LazyPage>} path="mtp" />
          <Route element={<LazyPage><TrackingPage /></LazyPage>} path="tracking" />
          <Route element={<LazyPage><ReportsPage /></LazyPage>} path="reports" />
          <Route element={<LazyPage><NotificationsPage /></LazyPage>} path="notifications" />
          <Route element={<LazyPage><SettingsPage /></LazyPage>} path="settings" />
          <Route element={<LazyPage><NotFoundPage /></LazyPage>} path="404" />
          <Route element={<Navigate replace to="/404" />} path="*" />
        </Route>
      </Route>
    </Routes>
  );
}