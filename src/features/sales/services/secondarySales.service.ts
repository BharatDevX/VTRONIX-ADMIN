import { supabase } from "../../../services/supabase";
import type { SecondarySale } from "../types/secondarySales.types";

/**
 * Admin-only Secondary Sale report.
 *
 * The database uses RLS on the secondary sale tables, so the Admin Panel
 * reads this report through the dedicated SECURITY DEFINER RPC instead of
 * querying the protected tables one-by-one from the browser.
 */
export async function getSecondarySales(employeeId: string, saleDate?: string): Promise<SecondarySale[]> {
  const normalizedEmployeeId = employeeId?.trim();
  if (!normalizedEmployeeId) return [];

  const { data, error } = await supabase.rpc("admin_get_secondary_sales", {
    p_employee_id: normalizedEmployeeId,
    p_sale_date: saleDate?.trim() || null,
  });

  if (error) {
    console.error("Secondary Sale RPC error:", error);
    throw new Error(error.message || "Unable to load the secondary sales report right now.");
  }

  return ((data ?? []) as SecondarySale[]).map((row) => ({
    id: String(row.id),
    sale_date: String(row.sale_date ?? ""),
    employee_name: String(row.employee_name ?? ""),
    dealer_name: String(row.dealer_name ?? ""),
    hq: String(row.hq ?? ""),
    product_name: String(row.product_name ?? ""),
    pack_size: String(row.pack_size ?? ""),
    quantity: Number(row.quantity ?? 0),
    rate: Number(row.rate ?? 0),
    amount: Number(row.amount ?? 0),
  }));
}
