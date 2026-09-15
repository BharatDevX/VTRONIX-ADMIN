import { supabase } from "@/services/supabase";

export interface HqReceivableRecord {
  id: string;
  employee_id: string;
  employee_name?: string | null;
  employee_number?: string | null;
  hq: string;
  month: number;
  year: number;
  paid_amount: number;
  overdue_amount: number;
  updated_at: string | null;
}

export async function getHqReceivables(month: number, year: number) {
  const { data, error } = await supabase
    .from("hq_receivables")
    .select("id, employee_id, hq, month, year, paid_amount, overdue_amount, updated_at")
    .eq("month", month)
    .eq("year", year)
    .order("hq");

  if (error) throw error;

  const rows = (data ?? []) as HqReceivableRecord[];
  const employeeIds = Array.from(new Set(rows.map((row) => row.employee_id).filter(Boolean)));
  if (!employeeIds.length) return rows;

  const { data: employees, error: employeeError } = await supabase
    .from("employees")
    .select("id, employee_id, full_name")
    .in("id", employeeIds);
  if (employeeError) throw employeeError;

  const employeeMap = new Map((employees ?? []).map((employee) => [employee.id, employee]));
  return rows.map((row) => {
    const employee = employeeMap.get(row.employee_id);
    return { ...row, employee_name: employee?.full_name ?? null, employee_number: employee?.employee_id ?? null };
  });
}

export async function saveHqReceivable(
  employeeId: string,
  hq: string,
  month: number,
  year: number,
  paidAmount: number,
  overdueAmount: number,
) {
  const normalized = hq.trim();
  if (!employeeId) throw new Error("Please select an employee.");
  if (!normalized) throw new Error("Please select or enter a Head Quarter.");
  if (!Number.isFinite(paidAmount) || paidAmount < 0) throw new Error("Please enter a valid paid amount.");
  if (!Number.isFinite(overdueAmount) || overdueAmount < 0) throw new Error("Please enter a valid overdue amount.");

  const { data: existing, error: lookupError } = await supabase
    .from("hq_receivables")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("hq", normalized)
    .eq("month", month)
    .eq("year", year)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;

  const values = { employee_id: employeeId, hq: normalized, month, year, paid_amount: paidAmount, overdue_amount: overdueAmount, updated_at: new Date().toISOString() };
  if (existing?.id) {
    const { data, error } = await supabase
      .from("hq_receivables")
      .update(values)
      .eq("id", existing.id)
      .select("id, employee_id, hq, month, year, paid_amount, overdue_amount, updated_at")
      .single();
    if (error) throw error;
    return data as HqReceivableRecord;
  }

  const { data, error } = await supabase
    .from("hq_receivables")
    .insert(values)
    .select("id, employee_id, hq, month, year, paid_amount, overdue_amount, updated_at")
    .single();
  if (error) throw error;
  return data as HqReceivableRecord;
}

export async function getHqNames() {
  const { data, error } = await supabase.from("dealers").select("hq").not("hq", "is", null).order("hq");
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((row: { hq?: string | null }) => String(row.hq ?? "").trim()).filter(Boolean)));
}
