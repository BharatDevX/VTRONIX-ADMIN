import { getEmployeesByIds } from "@/features/shared/real-db";
import { monthIsoPrefix, todayIsoDate } from "@/lib/format";
import { supabase } from "@/services/supabase";
import type { ActivityRecord, DashboardStats, TopPerformer, TrendPoint } from "@/types/domain";

async function countRows(table: string, equals: Record<string, string | boolean> = {}) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  Object.entries(equals).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  const { count, error } = await query;
  if (error) {
    throw error;
  }
  return count ?? 0;
}

async function sumSales(fromDate: string) {
  const { data, error } = await supabase.from("sales").select("amount").gte("sale_date", fromDate);
  if (error) {
    throw error;
  }
  return ((data ?? []) as Array<{ amount: number | null }>).reduce((total, row) => total + Number(row.amount ?? 0), 0);
}
async function getSalesByType(
  saleType: string,
  fromDate?: string,
) {
  let query = supabase
    .from("sales")
    .select("amount")
    .eq("sale_type", saleType);

  if (fromDate) {
    query = query.gte("sale_date", fromDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).reduce(
    (sum, row: any) => sum + Number(row.amount ?? 0),
    0
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = todayIsoDate();
  const month = `${monthIsoPrefix()}-01`;

  const [

totalEmployees,

activeEmployees,

inactiveEmployees,

presentToday,

absentToday,

todaysSales,

monthlySales,

counterSale,

doctorSale,

retailerSale,

farmerSale,

workSessions,

] = await Promise.all([

countRows("employees"),

countRows("employees",{is_active:true}),

countRows("employees",{is_active:false}),

countRows("attendance",{
attendance_date:today,
status:"PRESENT"
}),

countRows("attendance",{
attendance_date:today,
status:"ABSENT"
}),

sumSales(today),

sumSales(month),

getSalesByType("COUNTER",month),

getSalesByType("DOCTOR",month),

getSalesByType("RETAILER",month),

getSalesByType("FARMER",month),

supabase
.from("work_sessions")
.select("total_km")
.eq("work_date",today),

]);
  if (workSessions.error) {
    throw workSessions.error;
  }

  const todaysKm = ((workSessions.data ?? []) as Array<{ total_km: number | null }>).reduce((total, row) => total + Number(row.total_km ?? 0), 0);

  return {
    absentToday,
    activeEmployees,
    inactiveEmployees,
    monthlySales,
    presentToday,
    counterSale,
    

doctorSale,

retailerSale,

farmerSale,
    todaysKm,
    todaysSales,
    totalEmployees,
  };
}

export async function getDashboardTrends(): Promise<TrendPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 11);
  const start = startDate.toISOString().slice(0, 10);

  const [sales, attendance, doctorVisits, dealerVisits] = await Promise.all([
    supabase.from("sales").select("sale_date, amount").gte("sale_date", start),
    supabase.from("attendance").select("attendance_date, status").gte("attendance_date", start),
    supabase.from("doctor_visits").select("visit_date").gte("visit_date", start),
    supabase.from("dealer_visits").select("visit_date").gte("visit_date", start),
  ]);

  for (const result of [sales, attendance, doctorVisits, dealerVisits]) {
    if (result.error) {
      throw result.error;
    }
  }

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const daySales = ((sales.data ?? []) as Array<{ amount: number; sale_date: string }>).filter((row) => row.sale_date === key);
    const dayAttendance = ((attendance.data ?? []) as Array<{ attendance_date: string; status: string }>).filter((row) => row.attendance_date === key && row.status === "PRESENT");

    return {
      attendance: dayAttendance.length,
      dealerVisits: ((dealerVisits.data ?? []) as Array<{ visit_date: string }>).filter((row) => row.visit_date === key).length,
      doctorVisits: ((doctorVisits.data ?? []) as Array<{ visit_date: string }>).filter((row) => row.visit_date === key).length,
      label,
      revenue: daySales.reduce((total, row) => total + Number(row.amount ?? 0), 0),
      sales: daySales.length,
    };
  });
}

export async function getRecentActivities(): Promise<ActivityRecord[]> {
  const [attendance, sales, doctorVisits, dealerVisits] = await Promise.all([
    supabase.from("attendance").select("id, employee_id, attendance_date, status, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("sales").select("id, employee_id, sale_date, amount, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("doctor_visits").select("id, employee_id, visit_date, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("dealer_visits").select("id, employee_id, visit_date, created_at").order("created_at", { ascending: false }).limit(4),
  ]);

  for (const result of [attendance, sales, doctorVisits, dealerVisits]) {
    if (result.error) {
      throw result.error;
    }
  }

  const rows = [
    ...((attendance.data ?? []) as Array<{ created_at: string; employee_id: string; id: string; status: string }>).map((row) => ({
      created_at: row.created_at,
      description: `Attendance marked as ${row.status}.`,
      employee_id: row.employee_id,
      id: `attendance-${row.id}`,
      title: "Attendance update",
    })),
    ...((sales.data ?? []) as Array<{ amount: number; created_at: string; employee_id: string; id: string }>).map((row) => ({
      created_at: row.created_at,
      description: `Sale booked for ${Number(row.amount).toLocaleString("en-IN")}.`,
      employee_id: row.employee_id,
      id: `sale-${row.id}`,
      title: "Sales update",
    })),
    ...((doctorVisits.data ?? []) as Array<{ created_at: string; employee_id: string; id: string }>).map((row) => ({
      created_at: row.created_at,
      description: "Doctor visit recorded.",
      employee_id: row.employee_id,
      id: `doctor-${row.id}`,
      title: "Doctor visit",
    })),
    ...((dealerVisits.data ?? []) as Array<{ created_at: string; employee_id: string; id: string }>).map((row) => ({
      created_at: row.created_at,
      description: "Dealer visit recorded.",
      employee_id: row.employee_id,
      id: `dealer-${row.id}`,
      title: "Dealer visit",
    })),
  ].sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));

  const employees = await getEmployeesByIds(rows.map((row) => row.employee_id));

  return rows.slice(0, 8).map((row) => ({
    created_at: row.created_at,
    description: `${employees.get(row.employee_id)?.full_name ?? "Employee"}: ${row.description}`,
    id: row.id,
    title: row.title,
  }));
}

export async function getTopPerformers(): Promise<TopPerformer[]> {
  const month = `${monthIsoPrefix()}-01`;
  const { data, error } = await supabase.from("sales").select("employee_id, amount").gte("sale_date", month);
  if (error) {
    throw error;
  }

  const totals = new Map<string, number>();
  ((data ?? []) as Array<{ amount: number; employee_id: string }>).forEach((row) => {
    totals.set(row.employee_id, (totals.get(row.employee_id) ?? 0) + Number(row.amount ?? 0));
  });

  const employees = await getEmployeesByIds(Array.from(totals.keys()));

 return Array.from(totals.entries())
  .map(([employeeId, revenue]) => {
    const saleCount = (data ?? []).filter(
      (row: any) => row.employee_id === employeeId
    ).length;

    return {
      branch: employees.get(employeeId)?.branch ?? "-",
      employee_id: employeeId,
      employee_name:
        employees.get(employeeId)?.full_name ??
        "Unknown Employee",
      revenue,
      visits: saleCount,
    };
  })
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);
}
export async function getEmployeeWiseSales() {
  const month = `${monthIsoPrefix()}-01`;

  const { data, error } = await supabase
    .from("sales")
    .select("employee_id, amount")
    .gte("sale_date", month);

  if (error) throw error;

  const totals = new Map<string, number>();

  (data ?? []).forEach((row: any) => {
    totals.set(
      row.employee_id,
      (totals.get(row.employee_id) ?? 0) +
        Number(row.amount ?? 0)
    );
  });

  const employees = await getEmployeesByIds(
    Array.from(totals.keys())
  );

  return Array.from(totals.entries())
    .map(([employeeId, amount]) => ({
      employee_id: employeeId,
      employee_name:
        employees.get(employeeId)?.full_name ??
        "Unknown Employee",
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}