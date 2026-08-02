import { Activity, Bike, IndianRupee, Stethoscope, Store, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCard from "@/features/dashboard/components/DashboardCard";
import { useDashboardStats, useDashboardTrends, useRecentActivities, useTopPerformers } from "@/features/dashboard/useDashboard";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function DashboardPage() {
  const stats = useDashboardStats();
  const trends = useDashboardTrends();
  const activities = useRecentActivities();
  const performers = useTopPerformers();

  return (
    <div>
      <PageHeader
        description="Live operating cockpit for medical representatives, field movement, visits, sales, and approvals."
        eyebrow="Executive overview"
        title="Dashboard"
      />

      <div className="space-y-5 p-5">
        {stats.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => <Skeleton className="h-32" key={index} />)}
          </div>
        ) : stats.error ? (
          <EmptyState description={stats.error.message} title="Unable to load dashboard" variant="error" />
        ) : stats.data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <DashboardCard icon={<Users />} subtitle={`${stats.data.activeEmployees} active`} title="Total Employees" value={stats.data.totalEmployees} />
            <DashboardCard accent="bg-emerald-600" icon={<Activity />} title="Present Today" value={stats.data.presentToday} />
            <DashboardCard accent="bg-rose-600" title="Absent Today" value={stats.data.absentToday} />
            <DashboardCard accent="bg-indigo-600" icon={<IndianRupee />} title="Today's Sales" value={formatCurrency(stats.data.todaysSales)} />
            <DashboardCard accent="bg-cyan-600" icon={<IndianRupee />} title="Monthly Sales" value={formatCurrency(stats.data.monthlySales)} />
            <DashboardCard accent="bg-violet-600" icon={<Stethoscope />} title="Doctor Visits" value={stats.data.doctorVisits} />
            <DashboardCard accent="bg-amber-600" icon={<Store />} title="Dealer Visits" value={stats.data.dealerVisits} />
            <DashboardCard accent="bg-teal-600" icon={<Bike />} title="Today's KM" value={`${Math.round(stats.data.todaysKm)} KM`} />
            <DashboardCard title="Active Employees" value={stats.data.activeEmployees} />
            <DashboardCard accent="bg-slate-500" title="Inactive Employees" value={stats.data.inactiveEmployees} />
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">Sales and attendance trend</h2>
            </CardHeader>
            <CardContent className="h-80">
              {trends.isLoading ? <Skeleton className="h-full" /> : trends.data && trends.data.length > 0 ? (
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={trends.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} />
                    <YAxis tickLine={false} />
                    <Tooltip />
                    <Area dataKey="revenue" fill="#0f172a" fillOpacity={0.14} stroke="#0f172a" type="monotone" />
                    <Area dataKey="attendance" fill="#10b981" fillOpacity={0.12} stroke="#10b981" type="monotone" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState description="Metrics will appear after dashboard_daily_metrics receives records." title="No trend data" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">Top performers</h2>
            </CardHeader>
            <CardContent className="h-80">
              {performers.isLoading ? <Skeleton className="h-full" /> : performers.data && performers.data.length > 0 ? (
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={performers.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="employee_name" tickLine={false} />
                    <YAxis tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState description="Performance records will appear after employee_performance is populated." title="No performers yet" />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Recent activities</h2>
          </CardHeader>
          <CardContent>
            {activities.isLoading ? <Skeleton className="h-56" /> : activities.data && activities.data.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {activities.data.map((activity) => (
                  <div className="flex items-start justify-between gap-4 py-3" key={activity.id}>
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-400">{formatDateTime(activity.created_at)}</time>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState description="No recent operational events are available." title="No activity" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
