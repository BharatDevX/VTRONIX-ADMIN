import { supabase } from "../../../services/supabase";
import type { CounterSaleReport } from "../types/counterSale.types";

interface CounterSaleRow {
  id: string;
  dealer_name: string | null;
  product_name: string | null;
  quantity: number | null;
  rate: number | null;
  amount: number | null;
  sale_date: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: string }).message ?? "");
  }
  return "";
}

function toFriendlyError(error: unknown): Error {
  const message = getErrorMessage(error).toLowerCase();
  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return new Error("Network issue. Please check your connection and try again.");
  }
  return new Error("Unable to load the counter sales report right now.");
}

export async function getCounterSales(employeeId: string): Promise<CounterSaleReport[]> {
  const normalizedEmployeeId = employeeId?.trim();
  if (!normalizedEmployeeId) return [];

  try {
    const { data, error } = await supabase.rpc("admin_get_counter_sales", {
      p_employee_id: normalizedEmployeeId,
    });

    if (error) throw error;

    return ((data ?? []) as CounterSaleRow[]).map((item) => ({
      id: String(item.id),
      dealer_name: item.dealer_name ?? "",
      product_name: item.product_name ?? "",
      quantity: Number(item.quantity ?? 0),
      rate: Number(item.rate ?? 0),
      amount: Number(item.amount ?? 0),
      sale_date: item.sale_date,
    }));
  } catch (error) {
    throw toFriendlyError(error);
  }
}
