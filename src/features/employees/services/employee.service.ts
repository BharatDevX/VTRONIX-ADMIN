import { supabase } from "@/services/supabase";

import type {
  CreateEmployeeDTO,
  Employee,
  EmployeeFilters,
  EmployeeListResponse,
  UpdateEmployeeDTO,
} from "../types/employee.types";

const TABLE = "employees";

export async function getEmployees(filters: EmployeeFilters): Promise<EmployeeListResponse> {
  const { branch, designation, isActive, page, pageSize, search } = filters;

  let query = supabase.from(TABLE).select("*", { count: "exact" });

  if (search.trim()) {
    query = query.or(`full_name.ilike.%${search}%,employee_id.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (branch.trim()) {
    query = query.contains("head_quarters", [branch.trim()]);
  }

  if (designation.trim()) {
    query = query.eq("designation", designation);
  }

  if (isActive !== "all") {
    query = query.eq("is_active", isActive === "active");
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { count, data, error } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  return {
    count: count ?? 0,
    data: (data ?? []) as Employee[],
  };
}

export async function getEmployeeById(id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data as Employee;
}

export async function createEmployee(payload: CreateEmployeeDTO) {
  const normalizedHeadQuarters = Array.from(new Set((payload.head_quarters ?? []).map((value) => value.trim()).filter(Boolean)));
  const body = { ...payload, head_quarters: normalizedHeadQuarters, branch: payload.branch?.trim() || normalizedHeadQuarters[0] || null };
  const { data, error } = await supabase.functions.invoke("admin-create-employee", {
    body,
  });

  if (error) {
    throw new Error(error.message ?? "Unable to create employee.");
  }

  if (data && typeof data === "object" && "error" in data) {
    const message = typeof (data as { error?: { message?: string } }).error?.message === "string" ? (data as { error?: { message?: string } }).error?.message : "Unable to create employee.";
    throw new Error(message);
  }

  return data as Employee;
}

export async function updateEmployee(id: string, payload: UpdateEmployeeDTO) {
  const normalizedHeadQuarters = payload.head_quarters ? Array.from(new Set(payload.head_quarters.map((value) => value.trim()).filter(Boolean))) : undefined;
  const nextPayload = { ...payload, ...(normalizedHeadQuarters ? { head_quarters: normalizedHeadQuarters, branch: normalizedHeadQuarters[0] || null } : {}) };
  const { data, error } = await supabase.from(TABLE).update(nextPayload).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Employee;
}

export async function toggleEmployeeStatus(id: string, is_active: boolean) {
  const { data, error } = await supabase.from(TABLE).update({ is_active }).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Employee;
}

export async function resetEmployeePassword(id: string) {
  const { data, error } = await supabase.functions.invoke("admin-reset-employee-password", {
    body: { employeeId: id },
  });

  if (error) {
    throw error;
  }

  return data as { temporaryPassword?: string };
}
