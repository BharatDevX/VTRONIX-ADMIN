import { supabase } from "@/services/supabase";
import type { Employee } from "@/types/domain";

export interface DoctorMaster {
  doctor_name: string;
  id: string;
}

export interface DealerMaster {
  dealer_name: string;
  id: string;
}

export interface ProductMaster {
  id: string;
  product_name: string;
}

export interface WorkSessionRow {
  employee_id: string;
  end_latitude: number | null;
  end_longitude: number | null;
  end_time: string | null;
  id: string;
  start_latitude: number | null;
  start_longitude: number | null;
  start_time: string | null;
  status: "started" | "completed";
  total_km: number;
  work_date: string;
}

export function isMissingTable(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && String((error as { code?: string }).code) === "42P01";
}

export async function getEmployeesByIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map<string, Employee>();
  }

  const { data, error } = await supabase.from("employees").select("*").in("id", uniqueIds);
  if (error) {
    throw error;
  }

  return new Map(((data ?? []) as Employee[]).map((employee) => [employee.id, employee]));
}

export async function getDoctorsByIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map<string, DoctorMaster>();
  }

  const { data, error } = await supabase.from("doctors").select("id, doctor_name").in("id", uniqueIds);
  if (error) {
    throw error;
  }

  return new Map(((data ?? []) as DoctorMaster[]).map((doctor) => [doctor.id, doctor]));
}

export async function getDealersByIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map<string, DealerMaster>();
  }

  const { data, error } = await supabase.from("dealers").select("id, dealer_name").in("id", uniqueIds);
  if (error) {
    throw error;
  }

  return new Map(((data ?? []) as DealerMaster[]).map((dealer) => [dealer.id, dealer]));
}

export async function getProductsByIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map<string, ProductMaster>();
  }

  const { data, error } = await supabase.from("products").select("id, product_name").in("id", uniqueIds);
  if (error) {
    throw error;
  }

  return new Map(((data ?? []) as ProductMaster[]).map((product) => [product.id, product]));
}
