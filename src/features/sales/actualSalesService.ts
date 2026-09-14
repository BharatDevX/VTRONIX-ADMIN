import { supabase } from "@/services/supabase";

export type PackagingOption = { pack_size: number; pack_uom: string; box_size: number; box_uom: string };
export type ActualSaleLineInput = { product_id: string; pack_size: string; box_count: number; quantity: number; rate: number };
export type ActualSaleListRow = { id: string; sale_date: string; employee_name: string; employee_id: string; dealer_name: string; hq: string; invoice_no: string; total_amount: number };

export async function getActualSales(): Promise<ActualSaleListRow[]> {
  const { data, error } = await supabase.from("actual_sales").select("id, sale_date, employee_id, dealer_id, hq, invoice_no, total_amount").order("sale_date", { ascending: false });
  if (error) throw error;
  if (!data?.length) return [];
  const employeeIds = [...new Set(data.map((row) => row.employee_id).filter(Boolean))];
  const dealerIds = [...new Set(data.map((row) => row.dealer_id).filter(Boolean))];
  const [{ data: employees, error: employeeError }, { data: dealers, error: dealerError }] = await Promise.all([
    supabase.from("employees").select("id, employee_id, full_name").in("id", employeeIds),
    supabase.from("dealers").select("id, dealer_name").in("id", dealerIds),
  ]);
  if (employeeError) throw employeeError;
  if (dealerError) throw dealerError;
  const employeeMap = new Map((employees ?? []).map((row: any) => [row.id, `${row.full_name ?? ""} (${row.employee_id ?? ""})`.trim()]));
  const dealerMap = new Map((dealers ?? []).map((row: any) => [row.id, row.dealer_name ?? ""]));
  return data.map((row: any) => ({ id: row.id, sale_date: row.sale_date, employee_name: employeeMap.get(row.employee_id) ?? "Unknown employee", employee_id: row.employee_id, dealer_name: dealerMap.get(row.dealer_id) ?? "Unknown dealer", hq: row.hq ?? "", invoice_no: row.invoice_no ?? "-", total_amount: Number(row.total_amount ?? 0) }));
}

export async function createActualSale(input: { employee_id: string; dealer_id: string; sale_date: string; hq: string; invoice_no?: string; credit_period?: number | null; due_date?: string | null; lines: ActualSaleLineInput[] }) {
  if (!input.employee_id) throw new Error("Please select an employee.");
  if (!input.dealer_id) throw new Error("Please select a dealer.");
  if (!input.hq.trim()) throw new Error("Head Quarter is required.");
  if (!input.lines.length) throw new Error("Please add at least one medicine.");
  if (input.lines.some((line) => !line.product_id || !line.pack_size || line.box_count <= 0 || line.quantity <= 0 || line.rate <= 0)) throw new Error("Complete pack size, box and rate for every medicine.");
  const total = input.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  const { data, error } = await supabase.from("actual_sales").insert({ employee_id: input.employee_id, dealer_id: input.dealer_id, sale_date: input.sale_date, hq: input.hq.trim(), invoice_no: input.invoice_no?.trim() || null, credit_period: input.credit_period ?? null, due_date: input.due_date || null, total_amount: total }).select("id").single();
  if (error) throw error;
  try {
    const { error: lineError } = await supabase.from("actual_sale_products").insert(input.lines.map((line) => ({ parent_id: data.id, product_id: line.product_id, pack_size: line.pack_size, box_count: line.box_count, quantity: line.quantity, rate: line.rate, amount: line.quantity * line.rate })));
    if (lineError) throw lineError;
  } catch (error) {
    await supabase.from("actual_sales").delete().eq("id", data.id);
    throw error;
  }
  return data.id;
}
