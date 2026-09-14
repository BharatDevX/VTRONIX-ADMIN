import { supabase } from "../../../services/supabase/supabase";
import { SecondarySale } from "../types/secondarySales.types";

interface RelatedName {
  dealer_name?: string | null;
  product_name?: string | null;
}

interface SecondarySaleRow {
  quantity: number | null;
  amount: number | null;
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

  return new Error("Unable to load the secondary sales report right now.");
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getSecondarySales(employeeId: string, saleDate?: string): Promise<SecondarySale[]> {
  if (!employeeId) {
    return [];
  }

  let query = supabase
    .from("sales")
    .select(`
      quantity,
      amount,
      dealers(dealer_name),
      products(product_name)
    `)
    .eq("employee_id", employeeId)
    .order("sale_date", {
      ascending: false,
    })
    .order("created_at", { ascending: false });

  if (saleDate?.trim()) {
    query = query.eq("sale_date", saleDate.trim());
  }

  const { data, error } = await query;

  if (error) throw toFriendlyError(error);

  const reports: SecondarySale[] = [];

  ((data ?? []) as SecondarySaleRow[]).forEach((item) => {
    const dealer = firstRelation(item.dealers);
    const product = firstRelation(item.products);

    const dealerName = dealer?.dealer_name ?? "";
    const productName = product?.product_name ?? "";
    const quantity = Number(item.quantity ?? 0);
    const amount = Number(item.amount ?? 0);

    const existingReport = reports.find(
      (report) => report.dealer_name === dealerName && report.product_name === productName
    );

    if (existingReport) {
      existingReport.total_quantity += quantity;
      existingReport.total_amount += amount;
      return;
    }

    reports.push({
      dealer_name: dealerName,
      product_name: productName,
      total_quantity: quantity,
      total_amount: amount,
    });
  });

  return reports.sort((left, right) => left.dealer_name.localeCompare(right.dealer_name));
}
