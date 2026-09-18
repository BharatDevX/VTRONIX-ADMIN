import { supabase } from "@/services/supabase";

export type PackagingOption = { pack_size: number; pack_uom: string; box_size: number; box_uom: string };
export type ActualSaleLineInput = { product_id: string; pack_size: string; box_count: number; quantity: number; rate: number };
export type ActualSaleProductRow = {
  product_id: string;
  product_name: string;
  pack_size: string;
  box_count: number;
  quantity: number;
  rate: number;
  amount: number;
};

export type ActualSaleListRow = { id: string; sale_date: string; employee_name: string; employee_id: string; dealer_name: string; hq: string; invoice_no: string; total_amount: number };

export type ActualSaleDetails = ActualSaleListRow & {
  credit_period: number | null;
  due_date: string | null;
  products: ActualSaleProductRow[];
};

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

export async function getActualSaleDetails(id: string): Promise<ActualSaleDetails> {
  if (!id) throw new Error("Sales invoice ID is required.");

  const { data: sale, error: saleError } = await supabase
    .from("actual_sales")
    .select("id, sale_date, employee_id, dealer_id, hq, invoice_no, total_amount, credit_period, due_date")
    .eq("id", id)
    .single();
  if (saleError) throw saleError;

  const [{ data: employee, error: employeeError }, { data: dealer, error: dealerError }, { data: productLines, error: productLineError }] = await Promise.all([
    supabase.from("employees").select("id, employee_id, full_name").eq("id", sale.employee_id).maybeSingle(),
    supabase.from("dealers").select("id, dealer_name").eq("id", sale.dealer_id).maybeSingle(),
    supabase.from("actual_sale_products").select("product_id, pack_size, box_count, quantity, rate, amount").eq("parent_id", id).order("created_at", { ascending: true }),
  ]);

  if (employeeError) throw employeeError;
  if (dealerError) throw dealerError;
  if (productLineError) throw productLineError;

  const productIds = [...new Set((productLines ?? []).map((line: any) => line.product_id).filter(Boolean))];
  const { data: products, error: productError } = productIds.length
    ? await supabase.from("products").select("id, product_name").in("id", productIds)
    : { data: [], error: null };
  if (productError) throw productError;

  const productMap = new Map((products ?? []).map((row: any) => [row.id, row.product_name ?? "Unknown product"]));

  return {
    id: sale.id,
    sale_date: sale.sale_date,
    employee_name: `${employee?.full_name ?? ""} (${employee?.employee_id ?? ""})`.trim(),
    employee_id: sale.employee_id,
    dealer_name: dealer?.dealer_name ?? "Unknown dealer",
    hq: sale.hq ?? "",
    invoice_no: sale.invoice_no ?? "-",
    total_amount: Number(sale.total_amount ?? 0),
    credit_period: sale.credit_period == null ? null : Number(sale.credit_period),
    due_date: sale.due_date ?? null,
    products: (productLines ?? []).map((line: any) => ({
      product_id: line.product_id,
      product_name: productMap.get(line.product_id) ?? "Unknown product",
      pack_size: line.pack_size ?? "",
      box_count: Number(line.box_count ?? 0),
      quantity: Number(line.quantity ?? 0),
      rate: Number(line.rate ?? 0),
      amount: Number(line.amount ?? Number(line.quantity ?? 0) * Number(line.rate ?? 0)),
    })),
  };
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
