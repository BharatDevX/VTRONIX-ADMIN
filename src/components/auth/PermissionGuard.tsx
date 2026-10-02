import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/app/auth";
import { canAccessRoute } from "@/config/adminPermissions";

export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const { adminPermissions, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading || !adminPermissions) return null;

  // Let the index route choose the first permitted page for restricted admins.
  if (location.pathname === "/") return <>{children}</>;

  if (!canAccessRoute(adminPermissions, location.pathname)) {
    return <Navigate replace to="/forbidden" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
