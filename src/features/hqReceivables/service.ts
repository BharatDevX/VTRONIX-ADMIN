import { supabase } from "@/services/supabase";

export interface HqReceivableRecord {
  id: string;
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
    .select("id, hq, month, year, paid_amount, overdue_amount, updated_at")
    .eq("month", month)
    .eq("year", year)
    .order("hq");

  if (error) throw error;
  return (data ?? []) as HqReceivableRecord[];
}

export async function saveHqReceivable(
  hq: string,
  month: number,
  year: number,
  paidAmount: number,
  overdueAmount: number,
) {
  const normalized = hq.trim();
  if (!normalized) throw new Error("Please select or enter a Head Quarter.");
  if (!Number.isFinite(paidAmount) || paidAmount < 0) throw new Error("Please enter a valid paid amount.");
  if (!Number.isFinite(overdueAmount) || overdueAmount < 0) throw new Error("Please enter a valid overdue amount.");

  const { data: existing, error: lookupError } = await supabase
    .from("hq_receivables")
    .select("id")
    .eq("hq", normalized)
    .eq("month", month)
    .eq("year", year)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("hq_receivables")
      .update({ paid_amount: paidAmount, overdue_amount: overdueAmount, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id, hq, month, year, paid_amount, overdue_amount, updated_at")
      .single();
    if (error) throw error;
    return data as HqReceivableRecord;
  }

  const { data, error } = await supabase
    .from("hq_receivables")
    .insert({ hq: normalized, month, year, paid_amount: paidAmount, overdue_amount: overdueAmount })
    .select("id, hq, month, year, paid_amount, overdue_amount, updated_at")
    .single();

  if (error) throw error;
  return data as HqReceivableRecord;
}

export async function getHqNames() {
  const { data, error } = await supabase.from("dealers").select("hq").not("hq", "is", null).order("hq");
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((row: any) => String(row.hq ?? "").trim()).filter(Boolean)));
}
