import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  Stethoscope,
  Store,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Users, label: "Employees", to: "/employees" },
  { icon: ClipboardList, label: "Attendance", to: "/attendance" },
  { icon: Stethoscope, label: "Doctor", to: "/doctor" },
  { icon: Store, label: "Dealer", to: "/dealer" },
  { icon: ShoppingCart, label: "Sales", to: "/sales" },
  { icon: CalendarDays, label: "Monthly Tour Programme", to: "/mtp" },
  { icon: Map, label: "Live Tracking", to: "/tracking" },
  { icon: BarChart3, label: "Reports", to: "/reports" },
  { icon: Bell, label: "Notifications", to: "/notifications" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

function titleFromPath(pathname: string) {
  const item = navItems.find((navItem) => navItem.to === pathname);
  return item?.label ?? "Dashboard";
}

import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme";

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useTheme();

  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  return (
    <div className={cn("min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white")}> 
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition lg:translate-x-0 dark:bg-slate-900 dark:border-slate-800",
          collapsed && "lg:w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white dark:bg-slate-700">V</div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Vetronix</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Admin ERP</p>
            </div>
          ) : null}
          <Button className="ml-auto hidden lg:inline-flex" onClick={() => setCollapsed((value) => !value)} size="icon" variant="ghost">
            <ChevronLeft className={cn("transition", collapsed && "rotate-180")} />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                    "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white",
                    isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white dark:bg-slate-700",
                    collapsed && "lg:justify-center lg:px-0",
                )
              }
              key={item.to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              to={item.to}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Button className={cn("w-full", collapsed && "lg:px-0")} onClick={() => void signOut()} variant="ghost">
            <LogOut />
            {!collapsed ? "Logout" : null}
          </Button>
        </div>
      </aside>

      {mobileOpen ? <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setMobileOpen(false)} type="button" /> : null}

      <div className={cn("min-h-screen transition-[padding] lg:pl-72", collapsed && "lg:pl-20")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-5 dark:bg-slate-900/90 dark:border-slate-800">
          <Button className="lg:hidden" onClick={() => setMobileOpen(true)} size="icon" variant="ghost">
            <Menu />
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Home / {pageTitle}</p>
            <h2 className="truncate text-sm font-semibold text-slate-950 dark:text-white">{pageTitle}</h2>
          </div>
          <div className="ml-auto hidden h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 md:flex dark:bg-slate-800 dark:border-slate-800 dark:text-slate-400">
            <Search className="size-4" />
            <span>Search employees, reports, visits</span>
          </div>
          <ThemeToggleButton />
          <Button size="icon" title="Notifications" variant="outline">
            <Bell />
          </Button>
          <div className="hidden items-center gap-3 pl-2 sm:flex">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-700">
              {(profile?.full_name ?? "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{profile?.full_name ?? "Administrator"}</p>
              <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">{profile?.role ?? "admin"}</p>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
