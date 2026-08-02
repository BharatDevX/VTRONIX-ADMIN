import { getDealersByIds, getDoctorsByIds, getEmployeesByIds, getProductsByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { PaginatedQuery, PaginatedResponse, SalesRecord } from "@/types/domain";

interface SalesRow {
  amount: number;
  created_at: string;
  dealer_id: string;
  doctor_id: string | null;
  employee_id: string;
  id: string;
  product_id: string;
  quantity: number;
  rate: number;
  sale_date: string;
  sale_type: "counter" | "doctor";
}

export async function getSales(params: PaginatedQuery): Promise<PaginatedResponse<SalesRecord>> {
  let query = supabase.from("sales").select("*", { count: "exact" });

  if (params.status !== "all") {
    query = query.eq("sale_type", params.status);
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  const { count, data, error } = await query.order("sale_date", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as SalesRow[];
  const [employees, doctors, dealers, products] = await Promise.all([
    getEmployeesByIds(rows.map((row) => row.employee_id)),
    getDoctorsByIds(rows.flatMap((row) => (row.doctor_id ? [row.doctor_id] : []))),
    getDealersByIds(rows.map((row) => row.dealer_id)),
    getProductsByIds(rows.map((row) => row.product_id)),
  ]);

  const mapped = rows
    .map((row) => {
      const employee = employees.get(row.employee_id);
      const dealer = dealers.get(row.dealer_id);
      const doctor = row.doctor_id ? doctors.get(row.doctor_id) : undefined;
      const product = products.get(row.product_id);

      return {
        amount: Number(row.amount),
        branch: employee?.branch ?? "-",
        channel: row.sale_type,
        customer_name: doctor?.doctor_name ?? dealer?.dealer_name ?? "Unknown customer",
        dealer_name: dealer?.dealer_name ?? "Unknown dealer",
        doctor_name: doctor?.doctor_name ?? null,
        employee_id: row.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        id: row.id,
        product_name: product?.product_name ?? "Unknown product",
        quantity: Number(row.quantity),
        rate: Number(row.rate),
        sale_date: row.sale_date,
      } satisfies SalesRecord;
    })
    .filter((row) => {
      const search = params.search.trim().toLowerCase();
      const haystack = `${row.employee_name} ${row.customer_name} ${row.product_name} ${row.dealer_name} ${row.branch}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesBranch = !params.branch.trim() || row.branch.toLowerCase() === params.branch.trim().toLowerCase();
      return matchesSearch && matchesBranch;
    });

  return {
    count: count ?? mapped.length,
    data: mapped,
  };
}
