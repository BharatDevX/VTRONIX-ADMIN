import { getDoctorsByIds, getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { DoctorVisitRecord, PaginatedQuery, PaginatedResponse } from "@/types/domain";

// NOTE ON COLUMN NAMES:
// `doctor_id`, `employee_id`, `visit_date`, `location`, `discussion`, `remarks`, and
// `next_followup_date` are confirmed real columns on `doctor_visits` (already used below and
// in the original Doctor Visits implementation). `reply` and a per-visit status column are
// requested by the admin UI but weren't previously read by any existing code, so they're read
// defensively via a short list of likely column-name variants and fall back to null/"-" if
// none match — no fake data. `created_at` is read directly since every other table in this
// project (products, doctors, dealers, employees) already has and uses that exact column name.
interface DoctorVisitRow {
  created_at?: string | null;
  discussion: string | null;
  doctor_id: string;
  employee_id: string;
  id: string;
  location: string | null;
  next_followup_date: string | null;
  remarks: string | null;
  visit_date: string;
  visit_time: string | null;
  [key: string]: unknown;
}

function firstDefined(row: DoctorVisitRow, keys: string[]): unknown {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

export async function getDoctorVisits(params: PaginatedQuery): Promise<PaginatedResponse<DoctorVisitRecord>> {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  const { count, data, error } = await supabase
    .from("doctor_visits")
    .select("*", { count: "exact" })
    .order("visit_date", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as DoctorVisitRow[];
  const [employees, doctors] = await Promise.all([
    getEmployeesByIds(rows.map((row) => row.employee_id)),
    getDoctorsByIds(rows.map((row) => row.doctor_id)),
  ]);

  const mapped = rows
    .map((row) => {
      const employee = employees.get(row.employee_id);
      const doctor = doctors.get(row.doctor_id);
      const reply = firstDefined(row, ["reply", "doctor_reply", "response"]);
      const status = firstDefined(row, ["status", "visit_status"]);

      return {
        branch: employee?.branch ?? "-",
        city: row.location ?? "-",
        created_at: row.created_at ?? null,
        discussion: row.discussion ?? row.remarks ?? "-",
        doctor_name: doctor?.doctor_name ?? "Unknown doctor",
        employee_id: row.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        id: row.id,
        next_followup_date: row.next_followup_date,
        reply: reply === null ? null : String(reply),
        status: status === null ? null : String(status),
        visit_date: row.visit_date,
      };
    })
    .filter((row) => {
      const search = params.search.trim().toLowerCase();
      const haystack = `${row.employee_name} ${row.doctor_name} ${row.city} ${row.discussion} ${row.branch} ${row.status ?? ""}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesBranch = !params.branch.trim() || row.branch.toLowerCase() === params.branch.trim().toLowerCase();
      const matchesStatus = params.status === "all" || (row.status ?? "").toLowerCase() === params.status.toLowerCase();
      return matchesSearch && matchesBranch && matchesStatus;
    })
    .map(({ branch, ...rest }) => rest);

  return {
    count: count ?? mapped.length,
    data: mapped,
  };
}