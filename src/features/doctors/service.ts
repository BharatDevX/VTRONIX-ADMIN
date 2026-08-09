import { supabase } from "@/services/supabase";
import type { Doctor, PaginatedQuery, PaginatedResponse } from "@/types/domain";

interface DoctorRow {
  id: string;
  doctor_name: string;
  specialization: string | null;
  city: string | null;
  mobile: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getDoctors(params: PaginatedQuery): Promise<PaginatedResponse<Doctor>> {
  const { page, pageSize, search, status, branch } = params;
  let query = supabase.from("doctors").select("*", { count: "exact" });

  if (status !== "all") {
    query = query.eq("is_active", status === "active");
  }

  if (branch.trim()) {
    query = query.ilike("city", `%${branch.trim()}%`);
  }

  if (search.trim()) {
    query = query.or(
      `doctor_name.ilike.%${search.trim()}%,specialization.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%,mobile.ilike.%${search.trim()}%`,
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { count, data, error } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as DoctorRow[];

  return {
    count: count ?? rows.length,
    data: rows.map((row) => ({
      id: row.id,
      doctor_name: row.doctor_name,
      specialization: row.specialization ?? "-",
      city: row.city ?? "-",
      mobile: row.mobile ?? "-",
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
  };
}

export async function createDoctor(payload: Omit<Doctor, "id" | "created_at" | "updated_at">) {
  const duplicateCheck = await supabase
    .from("doctors")
    .select("id")
    .or(`doctor_name.ilike.%${payload.doctor_name}%,mobile.eq.${payload.mobile}`)
    .limit(1);

  if (duplicateCheck.error) {
    throw duplicateCheck.error;
  }

  if ((duplicateCheck.data ?? []).length > 0) {
    throw new Error("Doctor with this name or mobile already exists.");
  }

  const { data, error } = await supabase.from("doctors").insert({
    doctor_name: payload.doctor_name,
    specialization: payload.specialization,
    city: payload.city,
    mobile: payload.mobile,
    is_active: payload.is_active,
  }).select().single();

  if (error) {
    throw error;
  }

  return data as Doctor;
}

export async function updateDoctor(id: string, payload: Partial<Omit<Doctor, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase.from("doctors").update(payload).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Doctor;
}

export async function toggleDoctorStatus(id: string, is_active: boolean) {
  const { data, error } = await supabase.from("doctors").update({ is_active }).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Doctor;
}

export async function deleteDoctor(id: string) {
  const { data, error } = await supabase.from("doctors").delete().eq("id", id).select().single();
  if (error) {
    throw error;
  }
  return data as Doctor;
}
