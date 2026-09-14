import { supabase } from "../../../services/supabase";
import type { CounterSaleReport } from "../types/counterSale.types";

interface RelatedName {
  dealer_name?: string | null;
  product_name?: string | null;
}

interface CounterSaleRow {
  id: string;
  quantity: number | null;
  rate: number | null;
  amount: number | null;
  sale_date: string;
  dealers?: RelatedName | RelatedName[] | null;
  products?: RelatedName | RelatedName[] | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

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

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getCounterSales(employeeId: string): Promise<CounterSaleReport[]> {
  if (!employeeId) {
    return [];
  }

  const { data, error } = await supabase
    .from("sales")
    .select(`
      id,
      quantity,
      rate,
      amount,
      sale_date,
      dealers(dealer_name),
      products(product_name)
    `)
    .eq("employee_id", employeeId)
    .eq("sale_type", "counter")
    .is("doctor_id", null)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw toFriendlyError(error);

  return ((data ?? []) as CounterSaleRow[]).map((item) => {
    const quantity = Number(item.quantity ?? 0);
    const rate = Number(item.rate ?? 0);
    const dealer = firstRelation(item.dealers);
    const product = firstRelation(item.products);

    return {
      id: item.id,
      dealer_name: dealer?.dealer_name ?? "",
      product_name: product?.product_name ?? "",
      quantity,
      rate,
      amount: Number(item.amount ?? 0),
      sale_date: item.sale_date,
    };
  });
}
