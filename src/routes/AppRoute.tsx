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
const DoctorVisitsPage = lazy(() => import("@/pages/DoctorEmployeeVisitsPage"));
const DealerVisitsPage = lazy(() => import("@/pages/DealerEmployeeVisitsPage"));
const FarmerVisitsPage = lazy(() => import("@/pages/FarmerVisitPage"));
const DoctorMeetingPlanPage = lazy(() => import("@/pages/DoctorMeetingPlanPage"));
const DealerMeetingPlanPage = lazy(() => import("@/pages/DealerMeetingPlanPage"));
const FarmerMeetingPlanPage = lazy(() => import("@/pages/FarmerMeetingPlanPage"));
const EmployeeOrderFormPage = lazy(() => import("@/pages/EmployeeOrderFormPage"));
const EmployeeProfilePage = lazy(() => import("@/pages/EmployeeProfilePage"));
const EmployeeFollowUpsPage = lazy(() => import("@/pages/EmployeeFollowUpsPage"));
const EmployeesPage = lazy(() => import("@/pages/EmployeesPage"));
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"));
const MtpPage = lazy(() => import("@/pages/MtpPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const RetailersPage = lazy(() => import("@/pages/RetailersPage"));
const SalesPage = lazy(() => import("@/pages/SalesPage"));
const SalesTargetsPage = lazy(() => import("@/pages/SalesTargetsPage"));
const SalesInvoicePage = lazy(() => import("@/pages/SalesInvoicePage"));
const HqReceivablesPage = lazy(() => import("@/pages/HqReceivablesPage"));
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
          <Route element={<LazyPage><DoctorMeetingPlanPage /></LazyPage>} path="doctor-meeting-plan" />
          <Route element={<LazyPage><FarmerVisitsPage /></LazyPage>} path="farmer-visits" />
          <Route element={<LazyPage><DealerMeetingPlanPage /></LazyPage>} path="dealer-meeting-plan" />
          <Route element={<LazyPage><FarmerMeetingPlanPage /></LazyPage>} path="farmer-meeting-plan" />
          <Route element={<LazyPage><DealerPage /></LazyPage>} path="dealer" />
          <Route element={<LazyPage><DealerVisitsPage /></LazyPage>} path="dealer-visits" />
          <Route element={<LazyPage><DealersPage /></LazyPage>} path="dealers" />
          <Route element={<LazyPage><RetailersPage /></LazyPage>} path="retailers" />
          <Route element={<LazyPage><ProductsPage /></LazyPage>} path="products" />
          <Route element={<LazyPage><SalesPage /></LazyPage>} path="sales" />
          <Route element={<LazyPage><EmployeeOrderFormPage /></LazyPage>} path="order-form" />
          <Route element={<LazyPage><EmployeeProfilePage /></LazyPage>} path="employee-profile" />
          <Route element={<LazyPage><SalesTargetsPage /></LazyPage>} path="sales-targets" />
          <Route element={<LazyPage><SalesInvoicePage /></LazyPage>} path="sales-invoice" />
          <Route element={<LazyPage><HqReceivablesPage /></LazyPage>} path="hq-receivables" />
          <Route element={<LazyPage><EmployeeFollowUpsPage /></LazyPage>} path="follow-ups" />
          <Route element={<LazyPage><EmployeeFollowUpsPage /></LazyPage>} path="employee-follow-ups" />
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