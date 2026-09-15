import { Linking } from "react-native";
import { supabase } from "../../../services/supabase";
import type { EmployeeOrderDelivery, OrderDelivery, OrderInvoice } from "../types/orderDelivery.types";

const BUCKET = "sales-invoices";

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export async function getMyOrderDeliveries(employeeId: string): Promise<EmployeeOrderDelivery[]> {
  if (!employeeId) return [];

  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select(`
      id,
      employee_id,
      sale_date,
      amount,
      quantity,
      rate,
      sale_type,
      doctors(doctor_name),
      dealers(dealer_name),
      products(product_name)
    `)
    .eq("employee_id", employeeId)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (salesError) throw salesError;

  const sales = salesData ?? [];
  if (!sales.length) return [];

  const saleIds = sales.map((sale: any) => sale.id);

  const [{ data: deliveriesData, error: deliveriesError }, { data: invoicesData, error: invoicesError }] = await Promise.all([
    supabase.from("sales_deliveries").select("*").in("sale_id", saleIds).order("delivery_date", { ascending: true }),
    supabase.from("sales_invoices").select("*").in("sale_id", saleIds).order("uploaded_at", { ascending: false }),
  ]);

  if (deliveriesError) throw deliveriesError;
  if (invoicesError) throw invoicesError;

  const deliveries = (deliveriesData ?? []) as OrderDelivery[];
  const invoices = (invoicesData ?? []) as OrderInvoice[];

  return sales.map((sale: any) => {
    const saleDeliveries = deliveries.filter((delivery) => delivery.sale_id === sale.id);
    const deliveredAmount = saleDeliveries.reduce((sum, delivery) => sum + Number(delivery.delivered_amount ?? 0), 0);

    return {
      sale: {
        id: sale.id,
        sale_date: sale.sale_date,
        amount: Number(sale.amount ?? 0),
        quantity: Number(sale.quantity ?? 0),
        rate: Number(sale.rate ?? 0),
        sale_type: sale.sale_type,
        doctor_name: first(sale.doctors)?.doctor_name ?? "",
        dealer_name: first(sale.dealers)?.dealer_name ?? "",
        product_name: first(sale.products)?.product_name ?? "",
      },
      deliveries: saleDeliveries,
      invoices: invoices.filter((invoice) => invoice.sale_id === sale.id),
      deliveredAmount,
      remainingAmount: Math.max(0, Number(sale.amount ?? 0) - deliveredAmount),
    };
  });
}

export async function openOrderInvoice(filePath: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 300);
  if (error) throw error;
  await Linking.openURL(data.signedUrl);
}
