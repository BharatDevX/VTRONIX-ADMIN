import { supabase } from "@/services/supabase";

export interface SalesTargetRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  target_amount: number;
  created_at: string | null;
}

export async function getSalesTargets(month: number, year: number): Promise<SalesTargetRecord[]> {
  const { data, error } = await supabase
    .from("sales_targets")
    .select("id, employee_id, month, year, target_amount, created_at")
    .eq("month", month)
    .eq("year", year)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SalesTargetRecord[];
}

export async function saveSalesTarget(
  employeeId: string,
  month: number,
  year: number,
  targetAmount: number,
): Promise<SalesTargetRecord> {
  if (!employeeId) throw new Error("Please select an employee.");
  if (!Number.isFinite(targetAmount) || targetAmount < 0) {
    throw new Error("Please enter a valid target amount.");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("sales_targets")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("month", month)
    .eq("year", year)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("sales_targets")
      .update({ target_amount: targetAmount })
      .eq("id", existing.id)
      .select("id, employee_id, month, year, target_amount, created_at")
      .single();

    if (error) throw error;
    return data as SalesTargetRecord;
  }

  const { data, error } = await supabase
    .from("sales_targets")
    .insert({
      employee_id: employeeId,
      month,
      year,
      target_amount: targetAmount,
    })
    .select("id, employee_id, month, year, target_amount, created_at")
    .single();

  if (error) throw error;
  return data as SalesTargetRecord;
}
