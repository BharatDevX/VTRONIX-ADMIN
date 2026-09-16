import {
  BarChart3,
  Bell,
  BookUser,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Target,
  WalletCards,
  CalendarClock,
  Stethoscope,
  Store,
  Syringe,
  Users,
  UserRound,
  FileText,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navGroups = [
  { label: "", items: [{ icon: LayoutDashboard, label: "Dashboard", to: "/" }] },
  { label: "Attendance", items: [{ icon: ClipboardList, label: "Attendance", to: "/attendance" }] },
  { label: "Employees", items: [
    { icon: Users, label: "Employees", to: "/employees" },
    { icon: UserRound, label: "Employee Profile", to: "/employee-profile" },
  ] },
  { label: "Masters", items: [
    { icon: Stethoscope, label: "Doctor Master", to: "/doctor" },
    { icon: BookUser, label: "Dealer Master", to: "/dealers" },
    { icon: Users, label: "Retailers", to: "/retailers" },
    { icon: Package, label: "Products", to: "/products" },
  ] },
  { label: "Daily Progress", items: [
    { icon: Syringe, label: "Doctor Visits", to: "/doctor-visits" },
    { icon: Store, label: "Dealer Visits", to: "/dealer-visits" },
    { icon: Users, label: "Farmer Visits", to: "/farmer-visits" },
  ] },
  { label: "Meeting Plans", items: [
    { icon: CalendarDays, label: "Doctor Meeting Plan", to: "/doctor-meeting-plan" },
    { icon: CalendarDays, label: "Dealer Meeting Plan", to: "/dealer-meeting-plan" },
    { icon: CalendarDays, label: "Farmer Meeting Plan", to: "/farmer-meeting-plan" },
    { icon: CalendarDays, label: "Monthly Tour Programme", to: "/mtp" },
  ] },
  { label: "Sales", items: [
    { icon: ShoppingCart, label: "Order Form", to: "/order-form" },
    { icon: FileText, label: "Sales Invoice", to: "/sales-invoice" },
    { icon: Target, label: "Monthly Sales Targets", to: "/sales-targets" },
    { icon: WalletCards, label: "Counter Sale", to: "/counter-sales" },
    { icon: WalletCards, label: "Secondary Sale", to: "/secondary-sales" },
    { icon: WalletCards, label: "Doctor Wise Sale", to: "/doctor-wise-sales" },
  ] },
  { label: "Finance", items: [
    { icon: WalletCards, label: "HQ Receivables", to: "/hq-receivables" },
  ] },
  { label: "Operations", items: [
    { icon: CalendarClock, label: "Follow-Ups", to: "/employee-follow-ups" },
    { icon: Map, label: "Live Tracking", to: "/tracking" },
  ] },
  { label: "System", items: [
    { icon: BarChart3, label: "Reports", to: "/reports" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ] },
];

function titleFromPath(pathname: string) {
  for (const group of navGroups) {
    const item = group.items.find((navItem) => navItem.to === pathname);
    if (item) return item.label;
  }
  return "Dashboard";
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
          <img
  src={logo}
  alt=""
  className="h-10 w-10 shrink-0 rounded-xl object-contain"
/>
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
          {navGroups.map((group) => (
            <div key={group.label || "dashboard"} className="mb-4">
              {!collapsed && group.label ? <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{group.label}</p> : null}
              {group.items.map((item) => (
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
            </div>
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