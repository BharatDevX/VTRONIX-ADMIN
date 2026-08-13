import { supabase } from "@/services/supabase";
import type { SaleDelivery, SaleDeliverySummary, SaleInvoice } from "./types";

export const SALES_INVOICE_BUCKET = "sales-invoices";

function calculateSummary(orderedAmount: number, deliveries: SaleDelivery[]): SaleDeliverySummary {
  const deliveredAmount = deliveries.reduce(
    (sum, delivery) => sum + Number(delivery.delivered_amount ?? 0),
    0,
  );
  const remainingAmount = Math.max(0, Number(orderedAmount) - deliveredAmount);

  return {
    orderedAmount: Number(orderedAmount),
    deliveredAmount,
    remainingAmount,
    status:
      deliveredAmount <= 0
        ? "pending"
        : remainingAmount <= 0
          ? "fully_delivered"
          : "partially_delivered",
  };
}

export async function getSaleDeliveries(saleId: string) {
  const { data, error } = await supabase
    .from("sales_deliveries")
    .select("*")
    .eq("sale_id", saleId)
    .order("delivery_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SaleDelivery[];
}

export async function getSaleInvoices(saleId: string) {
  const { data, error } = await supabase
    .from("sales_invoices")
    .select("*")
    .eq("sale_id", saleId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SaleInvoice[];
}

export async function getSaleDeliveryData(saleId: string, orderedAmount: number) {
  const [deliveries, invoices] = await Promise.all([
    getSaleDeliveries(saleId),
    getSaleInvoices(saleId),
  ]);

  return {
    deliveries,
    invoices,
    summary: calculateSummary(orderedAmount, deliveries),
  };
}

export async function createSaleDelivery(input: {
  saleId: string;
  employeeId: string;
  orderedAmount: number;
  deliveredAmount: number;
  deliveryDate: string;
  expectedDeliveryDate?: string | null;
  remarks?: string | null;
}) {
  const currentDeliveries = await getSaleDeliveries(input.saleId);
  const summary = calculateSummary(input.orderedAmount, currentDeliveries);
  const deliveredAmount = Number(input.deliveredAmount);

  if (!Number.isFinite(deliveredAmount) || deliveredAmount <= 0) {
    throw new Error("Delivered amount must be greater than zero.");
  }

  if (deliveredAmount > summary.remainingAmount) {
    throw new Error(
      `Delivered amount cannot exceed the remaining order amount of ₹${summary.remainingAmount.toFixed(2)}.`,
    );
  }

  const newTotal = summary.deliveredAmount + deliveredAmount;
  const nextStatus: SaleDelivery["status"] =
    newTotal >= input.orderedAmount ? "completed" : "partial";

  const { data, error } = await supabase
    .from("sales_deliveries")
    .insert({
      sale_id: input.saleId,
      employee_id: input.employeeId,
      delivered_amount: deliveredAmount,
      delivery_date: input.deliveryDate,
      expected_delivery_date: input.expectedDeliveryDate || null,
      status: nextStatus,
      remarks: input.remarks?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SaleDelivery;
}

export async function uploadSaleInvoice(input: {
  saleId: string;
  deliveryId: string;
  employeeId: string;
  invoiceNumber?: string;
  file: File;
}) {
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${input.employeeId}/${input.saleId}/${input.deliveryId}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(SALES_INVOICE_BUCKET)
    .upload(path, input.file, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("sales_invoices")
    .insert({
      sale_id: input.saleId,
      delivery_id: input.deliveryId,
      employee_id: input.employeeId,
      invoice_number: input.invoiceNumber?.trim() || null,
      file_name: input.file.name,
      file_path: path,
      file_type: input.file.type || null,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(SALES_INVOICE_BUCKET).remove([path]);
    throw error;
  }

  return data as SaleInvoice;
}

export async function createInvoiceSignedUrl(filePath: string, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from(SALES_INVOICE_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}
