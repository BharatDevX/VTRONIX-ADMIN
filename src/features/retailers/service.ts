import { supabase } from "@/services/supabase";
import type { PaginatedQuery, PaginatedResponse, Retailer } from "@/types/domain";

interface RetailerRow {
  id: string;
  retailer_name: string;
  city: string | null;
  mobile: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getRetailers(params: PaginatedQuery): Promise<PaginatedResponse<Retailer>> {
  const { page, pageSize, search, status, branch } = params;
  let query = supabase.from("retailers").select("*", { count: "exact" });

  if (status !== "all") {
    query = query.eq("is_active", status === "active");
  }

  if (branch.trim()) {
    query = query.ilike("city", `%${branch.trim()}%`);
  }

  if (search.trim()) {
    query = query.or(`retailer_name.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%,mobile.ilike.%${search.trim()}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { count, data, error } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as RetailerRow[];

  return {
    count: count ?? rows.length,
    data: rows.map((row) => ({
      id: row.id,
      retailer_name: row.retailer_name,
      city: row.city ?? "-",
      mobile: row.mobile ?? "-",
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
  };
}

export async function createRetailer(payload: Omit<Retailer, "id" | "created_at" | "updated_at">) {
  const duplicateCheck = await supabase.from("retailers").select("id").or(`retailer_name.ilike.%${payload.retailer_name}%,mobile.eq.${payload.mobile}`).limit(1);

  if (duplicateCheck.error) {
    throw duplicateCheck.error;
  }
  if ((duplicateCheck.data ?? []).length > 0) {
    throw new Error("Retailer with this name or mobile already exists.");
  }

  const { data, error } = await supabase.from("retailers").insert({
    retailer_name: payload.retailer_name,
    city: payload.city,
    mobile: payload.mobile,
    is_active: payload.is_active,
  }).select().single();

  if (error) {
    throw error;
  }

  return data as Retailer;
}

export async function updateRetailer(id: string, payload: Partial<Omit<Retailer, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase.from("retailers").update(payload).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Retailer;
}

export async function toggleRetailerStatus(id: string, is_active: boolean) {
  const { data, error } = await supabase.from("retailers").update({ is_active }).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Retailer;
}

export async function deleteRetailer(id: string) {
  const { data, error } = await supabase.from("retailers").delete().eq("id", id).select().single();
  if (error) {
    throw error;
  }

  return data as Retailer;
}
