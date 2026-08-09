import { supabase } from "@/services/supabase";
import type { Dealer, PaginatedQuery, PaginatedResponse } from "@/types/domain";

interface DealerRow {
  id: string;
  dealer_name: string;
  contact_person: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  gst_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getDealers(params: PaginatedQuery): Promise<PaginatedResponse<Dealer>> {
  const { page, pageSize, search, status, branch } = params;
  let query = supabase.from("dealers").select("*", { count: "exact" });

  if (status !== "all") {
    query = query.eq("is_active", status === "active");
  }

  if (branch.trim()) {
    query = query.ilike("state", `%${branch.trim()}%`);
  }

  if (search.trim()) {
    query = query.or(
      `dealer_name.ilike.%${search.trim()}%,contact_person.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%,mobile.ilike.%${search.trim()}%,gst_number.ilike.%${search.trim()}%`,
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { count, data, error } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as DealerRow[];

  return {
    count: count ?? rows.length,
    data: rows.map((row) => ({
      id: row.id,
      dealer_name: row.dealer_name,
      contact_person: row.contact_person ?? "-",
      mobile: row.mobile ?? "-",
      email: row.email ?? "-",
      city: row.city ?? "-",
      state: row.state ?? "-",
      address: row.address ?? "-",
      gst_number: row.gst_number ?? "-",
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
  };
}

export async function createDealer(payload: Omit<Dealer, "id" | "created_at" | "updated_at">) {
  const duplicateCheck = await supabase
    .from("dealers")
    .select("id")
    .or(`dealer_name.ilike.%${payload.dealer_name}%,mobile.eq.${payload.mobile}`)
    .limit(1);

  if (duplicateCheck.error) {
    throw duplicateCheck.error;
  }

  if ((duplicateCheck.data ?? []).length > 0) {
    throw new Error("Dealer with this name or mobile already exists.");
  }

  const { data, error } = await supabase.from("dealers").insert({
    dealer_name: payload.dealer_name,
    mobile: payload.mobile,
    email: payload.email,
    city: payload.city,
    is_active: payload.is_active,
  }).select().single();

  if (error) {
    throw error;
  }

  return data as Dealer;
}

export async function updateDealer(id: string, payload: Partial<Omit<Dealer, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase.from("dealers").update(payload).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Dealer;
}

export async function toggleDealerStatus(id: string, is_active: boolean) {
  const { data, error } = await supabase.from("dealers").update({ is_active }).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Dealer;
}

export async function deleteDealer(id: string) {
  const { data, error } = await supabase.from("dealers").delete().eq("id", id).select().single();
  if (error) {
    throw error;
  }
  return data as Dealer;
}