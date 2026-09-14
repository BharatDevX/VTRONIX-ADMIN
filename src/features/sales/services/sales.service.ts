import { supabase } from "../../../services/supabase";
import type { Sale, SaleForm, SaleType } from "../types/sales.types";

interface SalePayload {
  employee_id: string;
  doctor_id: string | null;
  retailer_id: string | null;
  dealer_id: string;
  product_id: string;
  product_ids: string[];
  sale_date: string;
  quantity: number;
  rate: number;
  sale_type: SaleType;
}

interface SaveSaleResult {
  data: Sale;
  isUpdate: boolean;
}

interface ErrorLike {
  code?: string;
  message?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as ErrorLike).message ?? "");
  }

  return "";
}

function getErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as ErrorLike).code ?? "");
  }

  return "";
}

function isDuplicateError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  const code = getErrorCode(error);

  return code === "23505" || message.includes("duplicate") || message.includes("already exists") || message.includes("unique");
}

function normalizeRequiredId(value: string | undefined): string {
  return value?.trim() ?? "";
}

function normalizeRetailerId(saleType: SaleType, retailerId?: string): string | null {
  if (saleType !== "retailer") {
    return null;
  }

  const trimmedRetailerId = retailerId?.trim();
  return trimmedRetailerId ? trimmedRetailerId : null;
}

async function replaceSaleProductMappings(saleId: string, productIds: string[]) {
  const uniqueProductIds = Array.from(new Set((productIds ?? []).filter(Boolean)));

  const { error: deleteError } = await supabase
    .from("sale_products")
    .delete()
    .eq("sale_id", saleId);

  if (deleteError) throw deleteError;
  if (uniqueProductIds.length === 0) return;

  const rows = uniqueProductIds.map((product_id) => ({
    sale_id: saleId,
    product_id,
  }));

  const { error: insertError } = await supabase
    .from("sale_products")
    .insert(rows);

  if (insertError) throw insertError;
}

async function findExistingSale(payload: SalePayload): Promise<Sale | null> {
  const baseQuery = supabase
    .from("sales")
    .select("*")
    .eq("employee_id", payload.employee_id)
    .eq("sale_type", payload.sale_type)
    .eq("dealer_id", payload.dealer_id)
    .eq("product_id", payload.product_id)
    .eq("sale_date", payload.sale_date)
    .order("created_at", { ascending: false })
    .limit(1);

  const doctorQuery = payload.doctor_id
    ? baseQuery.eq("doctor_id", payload.doctor_id)
    : baseQuery.is("doctor_id", null);

  const { data, error } = payload.retailer_id
    ? await doctorQuery.eq("retailer_id", payload.retailer_id).maybeSingle()
    : await doctorQuery.is("retailer_id", null).maybeSingle();

  if (error) {
    console.log("findExistingSale:", error);
    throw error;
  }

  return (data ?? null) as Sale | null;
}

async function updateExistingSale(existingId: string, payload: SalePayload): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .update({
      employee_id: payload.employee_id,
      doctor_id: payload.doctor_id,
      retailer_id: payload.retailer_id,
      dealer_id: payload.dealer_id,
      product_id: payload.product_id,
      sale_date: payload.sale_date,
      quantity: payload.quantity,
      rate: payload.rate,
      amount: payload.quantity * payload.rate,
      sale_type: payload.sale_type,
    })
    .eq("id", existingId)
    .select()
    .single();

  if (error) {
  console.log("updateExistingSale:", error);
  throw error;
}
  if (!data) throw new Error("Unable to save the order form right now.");

  return data as Sale;
}

export async function getSales(employeeId: string) {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("employee_id", employeeId)
    .order("sale_date", {
      ascending: false,
    });

 if (error) {
  console.log("getSales:", error);
  throw error;
}

  return (data ?? []) as Sale[];
}

export async function getTodaySalesTotal(employeeId: string): Promise<number> {
  if (!employeeId) {
    return 0;
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("sales")
    .select("amount")
    .eq("employee_id", employeeId)
    .eq("sale_date", today);

  if (error) {
    throw error;
  }

  return ((data ?? []) as Array<{ amount: number | null }>).reduce(
    (total, row) => total + Number(row.amount ?? 0),
    0
  );
}


export async function getMonthlySalesSummary(employeeId: string): Promise<{ achieved: number; target: number }> {
  if (!employeeId) return { achieved: 0, target: 0 };

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const monthStart = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10);

  const [{ data: salesRows, error: salesError }, { data: targetRow, error: targetError }] = await Promise.all([
    supabase
      .from("sales")
      .select("amount")
      .eq("employee_id", employeeId)
      .gte("sale_date", monthStart)
      .lte("sale_date", monthEnd),
    supabase
      .from("sales_targets")
      .select("target_amount")
      .eq("employee_id", employeeId)
      .eq("month", month)
      .eq("year", year)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (salesError) throw salesError;
  if (targetError) throw targetError;

  const achieved = ((salesRows ?? []) as Array<{ amount: number | null }>).reduce(
    (total, row) => total + Number(row.amount ?? 0),
    0,
  );

  return {
    achieved,
    target: Number((targetRow as { target_amount?: number | null } | null)?.target_amount ?? 0),
  };
}

export async function saveSale(employeeId: string, form: SaleForm): Promise<SaveSaleResult> {
  const quantity = Number(form.quantity);
  const rate = Number(form.rate);
  const dealerId = normalizeRequiredId(form.dealer_id);
  const productIds = Array.from(new Set((form.product_ids ?? []).map((id) => id.trim()).filter(Boolean)));
  const firstProductId = productIds[0] ?? "";
  const saleDate = form.sale_date?.trim();
  const retailerId = normalizeRetailerId(form.sale_type, form.retailer_id);

  if (!employeeId?.trim()) {
    throw new Error("Unable to save the order form right now.");
  }

  if (!dealerId) {
    throw new Error("Please select a dealer before saving.");
  }

  if (productIds.length === 0) {
    throw new Error("Please select at least one medicine.");
  }

  if (form.sale_type === "retailer" && !retailerId) {
    throw new Error("Please select a retailer for retailer sales.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than 0.");
  }

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Rate must be greater than 0.");
  }

  if (!saleDate) {
    throw new Error("Please select a sale date before saving.");
  }

  const payload: SalePayload = {
    employee_id: employeeId,
    doctor_id: null,
    retailer_id: retailerId,
    dealer_id: dealerId,
    product_id: firstProductId,
    product_ids: productIds,
    sale_date: saleDate,
    quantity,
    rate,
    sale_type: form.sale_type,
  };

  const existing = await findExistingSale(payload);
  let savedRecord: Sale;
  let isUpdate = false;

  if (existing?.id) {
    savedRecord = await updateExistingSale(existing.id, payload);
    isUpdate = true;
  } else {
    const { data, error } = await supabase
      .from("sales")
      .insert({
        employee_id: payload.employee_id,
        doctor_id: payload.doctor_id,
        retailer_id: payload.retailer_id,
        dealer_id: payload.dealer_id,
        product_id: payload.product_id,
        sale_date: payload.sale_date,
        quantity: payload.quantity,
        rate: payload.rate,
       
        sale_type: payload.sale_type,
      })
      .select()
      .single();

    if (error) {
      if (isDuplicateError(error)) {
        const saleCreatedByParallelRequest = await findExistingSale(payload);
        if (saleCreatedByParallelRequest?.id) {
          savedRecord = await updateExistingSale(saleCreatedByParallelRequest.id, payload);
          isUpdate = true;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    } else {
      if (!data) throw new Error("Unable to save the order form right now.");
      savedRecord = data as Sale;
    }
  }

  await replaceSaleProductMappings(savedRecord.id, productIds);

  return { data: savedRecord, isUpdate };
}
