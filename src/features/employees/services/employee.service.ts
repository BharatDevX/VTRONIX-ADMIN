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
  // Fetch the current row first and send only fields that actually changed.
  // This is important for legacy employee data: some older rows can contain
  // duplicate/legacy values (for example mobile numbers). Sending every form
  // field again can make PostgreSQL re-check an unrelated unique constraint
  // even when the admin is changing only the Head Quarter.
  const { data: currentEmployee, error: currentError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (currentError) {
    throw currentError;
  }

  const normalizedHeadQuarters = payload.head_quarters
    ? Array.from(
        new Set(
          payload.head_quarters
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
    : undefined;

  const nextPayload: Record<string, unknown> = {};

  if (payload.full_name !== undefined && payload.full_name !== currentEmployee.full_name) {
    nextPayload.full_name = payload.full_name;
  }

  if (payload.designation !== undefined && payload.designation !== currentEmployee.designation) {
    nextPayload.designation = payload.designation;
  }

  if (payload.mobile !== undefined && payload.mobile !== currentEmployee.mobile) {
    nextPayload.mobile = payload.mobile;
  }

  if (payload.email !== undefined) {
    // The employees table has a UNIQUE constraint on email.
    // The edit form uses an empty string when an employee has no email, but
    // PostgreSQL treats '' as a real value, so only one employee could save.
    // Store an empty email as NULL instead; PostgreSQL permits multiple NULLs
    // under a normal UNIQUE constraint.
    const normalizedEmail =
      typeof payload.email === "string"
        ? payload.email.trim() || null
        : payload.email;

    if (normalizedEmail !== currentEmployee.email) {
      nextPayload.email = normalizedEmail;
    }
  }

  if (normalizedHeadQuarters !== undefined) {
    const currentHeadQuarters = Array.isArray(currentEmployee.head_quarters)
      ? currentEmployee.head_quarters
      : [];

    if (JSON.stringify(currentHeadQuarters) !== JSON.stringify(normalizedHeadQuarters)) {
      nextPayload.head_quarters = normalizedHeadQuarters;
    }

    const nextBranch = normalizedHeadQuarters[0] || null;
    if (nextBranch !== currentEmployee.branch) {
      nextPayload.branch = nextBranch;
    }
  } else if (payload.branch !== undefined && payload.branch !== currentEmployee.branch) {
    nextPayload.branch = payload.branch;
  }

  if (payload.is_active !== undefined && payload.is_active !== currentEmployee.is_active) {
    nextPayload.is_active = payload.is_active;
  }

  // Nothing changed: return the existing employee instead of issuing a
  // pointless PATCH.
  if (Object.keys(nextPayload).length === 0) {
    return currentEmployee as Employee;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(nextPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // Preserve the database error details so the Admin UI can show the real
    // reason instead of the generic "Unable to save employee" message.
    const databaseError = new Error(error.message);
    Object.assign(databaseError, {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw databaseError;
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
