import dayjs from "dayjs";
import { supabase } from "@/services/supabase";
import { getDealersByIds, getDoctorsByIds, getProductsByIds } from "@/features/shared/real-db";
import type { Employee } from "@/types/domain";

export async function getAllEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from("employees").select("*").order("full_name");
  if (error) throw error;
  return (data ?? []) as Employee[];
}

export async function getEmployeeAttendance(employeeId: string, year: number, month: number) {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).startOf("month").format("YYYY-MM-DD");
  const end = dayjs(start).endOf("month").format("YYYY-MM-DD");
  const { data, error } = await supabase.from("attendance").select("*").eq("employee_id", employeeId).gte("attendance_date", start).lte("attendance_date", end).order("attendance_date");
  if (error) throw error;
  return data ?? [];
}

export async function getEmployeeDoctorVisits(employeeId: string) {
  const { data, error } = await supabase.from("doctor_visits").select("*").eq("employee_id", employeeId).order("visit_date", { ascending: false }).order("visit_time", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const doctors = await getDoctorsByIds(rows.map((row) => String(row.doctor_id ?? "")));
  return rows.map((row) => ({ ...row, doctor_name: doctors.get(String(row.doctor_id))?.doctor_name ?? "Unknown doctor" }));
}

export async function getEmployeeDealerVisits(employeeId: string) {
  const { data, error } = await supabase.from("dealer_visits").select("*").eq("employee_id", employeeId).order("visit_date", { ascending: false }).order("visit_time", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const dealers = await getDealersByIds(rows.map((row) => String(row.dealer_id ?? "")));
  return rows.map((row) => ({ ...row, dealer_name: dealers.get(String(row.dealer_id))?.dealer_name ?? "Unknown dealer" }));
}

export async function getEmployeeFarmerVisits(employeeId: string) {
  const { data, error } = await supabase.from("farmer_visits").select("*").eq("employee_id", employeeId).order("visit_date", { ascending: false }).order("visit_time", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getEmployeeDoctorPlans(employeeId: string, month = dayjs().month() + 1, year = dayjs().year()) {
  const { data, error } = await supabase.from("doctor_meeting_plans").select("*").eq("employee_id", employeeId).eq("month", month).eq("year", year).order("planned_date");
  if (error) throw error;
  const rows = data ?? [];
  const doctors = await getDoctorsByIds(rows.map((row) => String(row.doctor_id ?? "")));
  return rows.map((row) => ({ ...row, doctor_name: doctors.get(String(row.doctor_id))?.doctor_name ?? "Unknown doctor" }));
}

export async function getEmployeeDealerPlans(employeeId: string, month = dayjs().month() + 1, year = dayjs().year()) {
  const { data, error } = await supabase.from("dealer_meeting_plans").select("*").eq("employee_id", employeeId).eq("month", month).eq("year", year).order("planned_date");
  if (error) throw error;
  const rows = data ?? [];
  const dealers = await getDealersByIds(rows.map((row) => String(row.dealer_id ?? "")));
  return rows.map((row) => ({ ...row, dealer_name: dealers.get(String(row.dealer_id))?.dealer_name ?? "Unknown dealer" }));
}

export async function getEmployeeFarmerPlans(employeeId: string, month = dayjs().month() + 1, year = dayjs().year()) {
  const { data, error } = await supabase.from("farmer_meeting_plans").select("*").eq("employee_id", employeeId).eq("month", month).eq("year", year).order("planned_date");
  if (error) throw error;
  return data ?? [];
}

export async function getEmployeeFollowUps(employeeId: string) {
  const [{ data: doctors, error: doctorError }, { data: dealers, error: dealerError }, { data: farmers, error: farmerError }] = await Promise.all([
    supabase.from("doctor_visits").select("id, employee_id, doctor_id, visit_date, location, discussion, outcome, next_followup_date").eq("employee_id", employeeId).not("next_followup_date", "is", null),
    supabase.from("dealer_visits").select("id, employee_id, dealer_id, visit_date, location, discussion, outcome, next_followup_date").eq("employee_id", employeeId).not("next_followup_date", "is", null),
    supabase.from("farmer_visits").select("id, employee_id, farmer_name, visit_date, location, discussion, outcome, next_followup_date").eq("employee_id", employeeId).not("next_followup_date", "is", null),
  ]);
  if (doctorError) throw doctorError;
  if (dealerError) throw dealerError;
  if (farmerError) throw farmerError;
  const doctorRows = doctors ?? [];
  const dealerRows = dealers ?? [];
  const farmerRows = farmers ?? [];
  const [doctorMap, dealerMap] = await Promise.all([
    getDoctorsByIds(doctorRows.map((row) => String(row.doctor_id ?? ""))),
    getDealersByIds(dealerRows.map((row) => String(row.dealer_id ?? ""))),
  ]);
  return [
    ...doctorRows.map((row) => ({ ...row, visit_type: "Doctor", party_name: doctorMap.get(String(row.doctor_id))?.doctor_name ?? "Unknown doctor" })),
    ...dealerRows.map((row) => ({ ...row, visit_type: "Dealer", party_name: dealerMap.get(String(row.dealer_id))?.dealer_name ?? "Unknown dealer" })),
    ...farmerRows.map((row) => ({ ...row, visit_type: "Farmer", party_name: row.farmer_name ?? "Unknown farmer" })),
  ].sort((a, b) => String(b.next_followup_date).localeCompare(String(a.next_followup_date)));
}

export async function getEmployeeSalesSummary(employeeId: string) {
  const today = dayjs();
  const todayDate = today.format("YYYY-MM-DD");
  const monthStart = today.startOf("month").format("YYYY-MM-DD");
  const monthEnd = today.endOf("month").format("YYYY-MM-DD");
  const { data: sales, error: salesError } = await supabase.from("sales").select("sale_type, amount, sale_date").eq("employee_id", employeeId).gte("sale_date", monthStart).lte("sale_date", monthEnd);
  if (salesError) throw salesError;
  const rows = sales ?? [];
  const sum = (items: typeof rows) => items.reduce((total, row) => total + Number(row.amount ?? 0), 0);
  const counter = rows.filter((row) => row.sale_type === "counter");
  const doctor = rows.filter((row) => row.sale_type === "doctor");
  const secondary = rows.filter((row) => row.sale_type !== "doctor" && row.sale_type !== "counter");
  const [{ data: invoices, error: invoiceError }] = await Promise.all([
    supabase.from("actual_sales").select("total_amount, sale_date").eq("employee_id", employeeId).gte("sale_date", monthStart).lte("sale_date", monthEnd),
  ]);
  if (invoiceError) throw invoiceError;
  const invoiceRows = invoices ?? [];
  return {
    todaySales: sum(rows.filter((row) => row.sale_date === todayDate)),
    monthlySales: sum(rows),
    counterSales: sum(counter),
    doctorWiseSales: sum(doctor),
    secondarySales: sum(secondary),
    invoiceSales: invoiceRows.reduce((total, row) => total + Number(row.total_amount ?? 0), 0),
  };
}

export type EmployeeOrderFormRow = {
  id: string;
  order_number: string;
  sale_date: string;
  sale_type: "dealer" | "retailer" | "farmer" | string;
  hq: string;
  customer_name: string;
  amount: number;
};

export type EmployeeOrderFormDetails = {
  order_number: string;
  sale_date: string;
  sale_type: "dealer" | "retailer" | "farmer" | string;
  hq: string;
  employee_name: string;
  customer_name: string;
  lines: Array<{
    product_name: string;
    pack_size: string;
    box_count: number;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  total_amount: number;
};

function resolveOrderCustomer(row: any, dealers: Map<string, string>, retailers: Map<string, string>) {
  if (row.sale_type === "farmer") {
    return String(row.farmer_name ?? "").trim() || "Farmer";
  }
  if (row.sale_type === "retailer") {
    return row.retailer_id ? retailers.get(String(row.retailer_id)) ?? "Unknown retailer" : "Retailer";
  }
  return row.dealer_id ? dealers.get(String(row.dealer_id)) ?? "Unknown dealer" : "Dealer";
}

async function getOrderSalesRows(employeeId: string, orderNumber?: string) {
  let query = supabase
    .from("sales")
    .select("id, order_number, sale_date, sale_type, hq, dealer_id, retailer_id, farmer_name, product_id, pack_size, box_count, quantity, rate, amount, created_at")
    .eq("employee_id", employeeId)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (orderNumber?.trim()) {
    query = query.eq("order_number", orderNumber.trim());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getEmployeeOrderForms(employeeId: string): Promise<EmployeeOrderFormRow[]> {
  if (!employeeId?.trim()) return [];

  const rows = await getOrderSalesRows(employeeId);
  if (!rows.length) return [];

  const [dealersResult, retailersResult] = await Promise.all([
    supabase.from("dealers").select("id, dealer_name"),
    supabase.from("retailers").select("id, retailer_name"),
  ]);

  if (dealersResult.error) throw dealersResult.error;
  if (retailersResult.error) throw retailersResult.error;

  const dealerMap = new Map<string, string>(
    (dealersResult.data ?? []).map((row: any) => [String(row.id), String(row.dealer_name ?? "")]),
  );
  const retailerMap = new Map<string, string>(
    (retailersResult.data ?? []).map((row: any) => [String(row.id), String(row.retailer_name ?? "")]),
  );

  // The Order Form page is intentionally a summary/list view: one row per
  // order number, without medicine/product columns. The complete medicine
  // breakdown remains available from the individual PDF button.
  const grouped = new Map<string, EmployeeOrderFormRow>();

  for (const row of rows as any[]) {
    const orderNumber = String(row.order_number ?? row.id ?? "");
    const existing = grouped.get(orderNumber);
    const amount = Number(row.amount ?? Number(row.quantity ?? 0) * Number(row.rate ?? 0));

    if (existing) {
      existing.amount += amount;
      continue;
    }

    grouped.set(orderNumber, {
      id: String(row.id),
      order_number: orderNumber,
      sale_date: String(row.sale_date ?? ""),
      sale_type: String(row.sale_type ?? ""),
      hq: String(row.hq ?? ""),
      customer_name: resolveOrderCustomer(row, dealerMap, retailerMap),
      amount,
    });
  }

  return Array.from(grouped.values());
}

export async function getEmployeeOrderFormDetails(
  employeeId: string,
  orderNumber: string,
): Promise<EmployeeOrderFormDetails | null> {
  if (!employeeId?.trim() || !orderNumber?.trim()) return null;

  const rows = await getOrderSalesRows(employeeId, orderNumber);
  if (!rows.length) return null;

  const [employeeResult, dealersResult, retailersResult, productsResult] = await Promise.all([
    supabase.from("employees").select("full_name").eq("id", employeeId).maybeSingle(),
    supabase.from("dealers").select("id, dealer_name"),
    supabase.from("retailers").select("id, retailer_name"),
    getProductsByIds(rows.map((row: any) => String(row.product_id ?? ""))),
  ]);

  if (employeeResult.error) throw employeeResult.error;
  if (dealersResult.error) throw dealersResult.error;
  if (retailersResult.error) throw retailersResult.error;

  const dealerMap = new Map<string, string>(
    (dealersResult.data ?? []).map((row: any) => [String(row.id), String(row.dealer_name ?? "")]),
  );
  const retailerMap = new Map<string, string>(
    (retailersResult.data ?? []).map((row: any) => [String(row.id), String(row.retailer_name ?? "")]),
  );

  const first = rows[0] as any;
  const lines = rows.map((row: any) => ({
    product_name: productsResult.get(String(row.product_id ?? ""))?.product_name ?? "Unknown product",
    pack_size: String(row.pack_size ?? ""),
    box_count: Number(row.box_count ?? 0),
    quantity: Number(row.quantity ?? 0),
    rate: Number(row.rate ?? 0),
    amount: Number(row.amount ?? Number(row.quantity ?? 0) * Number(row.rate ?? 0)),
  }));

  return {
    order_number: String(first.order_number ?? first.id ?? ""),
    sale_date: String(first.sale_date ?? ""),
    sale_type: String(first.sale_type ?? ""),
    hq: String(first.hq ?? ""),
    employee_name: String(employeeResult.data?.full_name ?? ""),
    customer_name: resolveOrderCustomer(first, dealerMap, retailerMap),
    lines,
    total_amount: lines.reduce((sum, line) => sum + line.amount, 0),
  };
}

