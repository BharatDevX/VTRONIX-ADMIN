import { getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { MtpRecord, PaginatedQuery, PaginatedResponse } from "@/types/domain";

interface MtpRow {
  employee_id: string;
  id: string;
  month: number;
  status: MtpRecord["status"];
  updated_at: string;
  year: number;
}

interface MtpEntryRow {
  programme_id: string;
  total_km: number;
  tour_date: string;
}

export async function getMtpRecords(params: PaginatedQuery): Promise<PaginatedResponse<MtpRecord>> {
  let query = supabase.from("monthly_tour_programmes").select("*", { count: "exact" });

  if (params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  const { count, data, error } = await query.order("updated_at", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as MtpRow[];
  const [employees, entriesResult] = await Promise.all([
    getEmployeesByIds(rows.map((row) => row.employee_id)),
    rows.length > 0
      ? supabase.from("monthly_tour_entries").select("programme_id, tour_date, total_km").in("programme_id", rows.map((row) => row.id))
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (entriesResult.error) {
    throw entriesResult.error;
  }

  const entries = (entriesResult.data ?? []) as MtpEntryRow[];
  const mapped = rows
    .map((row) => {
      const employee = employees.get(row.employee_id);
      const programmeEntries = entries.filter((entry) => entry.programme_id === row.id);
      const plannedDays = new Set(programmeEntries.map((entry) => entry.tour_date)).size;

      return {
        approved_by: null,
        employee_id: row.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        id: row.id,
        month: row.month,
        planned_days: plannedDays,
        remarks: null,
        status: row.status,
        total_km: programmeEntries.reduce((total, entry) => total + Number(entry.total_km ?? 0), 0),
        updated_at: row.updated_at,
        year: row.year,
      };
    })
    .filter((row) => {
      const search = params.search.trim().toLowerCase();
      const branch = employees.get(row.employee_id)?.branch ?? "";
      const matchesSearch = !search || `${row.employee_name} ${row.month} ${row.year} ${row.status}`.toLowerCase().includes(search);
      const matchesBranch = !params.branch.trim() || branch.toLowerCase() === params.branch.trim().toLowerCase();
      return matchesSearch && matchesBranch;
    });

  return {
    count: count ?? mapped.length,
    data: mapped,
  };
}

export async function updateMtpStatus(id: string, status: MtpRecord["status"]) {
  const { data, error } = await supabase.from("monthly_tour_programmes").update({ status }).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as MtpRecord;
}
