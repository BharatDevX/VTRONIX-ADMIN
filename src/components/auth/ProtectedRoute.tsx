import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/app/auth";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute() {
  const { isLoading, role, session } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800 dark:shadow-none">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  if (role !== "admin") {
    <Navigate replace to="/forbidden" />
    return <Outlet />;
  }
  console.log(session)

  return <Outlet />;
}