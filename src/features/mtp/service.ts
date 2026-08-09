import { getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { MtpEntry, MtpProgrammeEntriesResponse, MtpRecord, PaginatedQuery, PaginatedResponse } from "@/types/domain";

interface MtpRow {
  approved_by: string | null;
  employee_id: string;
  id: string;
  month: number;
  remarks: string | null;
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
        approved_by: row.approved_by ?? null,
        employee_id: row.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        id: row.id,
        month: row.month,
        planned_days: plannedDays,
        remarks: row.remarks ?? null,
        status: row.status,
        total_km: programmeEntries.reduce((total, entry) => total + Number(entry.total_km ?? 0), 0),
        updated_at: row.updated_at,
        year: row.year,
      };
    })
    .filter((row) => {
      const search = params.search.trim().toLowerCase();
      const branch = employees.get(row.employee_id)?.branch ?? "";
      const matchesSearch = !search || `${row.employee_name} ${row.month} ${row.year} ${row.status} ${row.remarks ?? ""}`.toLowerCase().includes(search);
      const matchesBranch = !params.branch.trim() || branch.toLowerCase() === params.branch.trim().toLowerCase();
      return matchesSearch && matchesBranch;
    });

  return {
    count: count ?? mapped.length,
    data: mapped,
  };
}

// NOTE ON COLUMN NAMES:
// `monthly_tour_entries.programme_id`, `tour_date`, and `total_km` are confirmed real columns
// (already used by getMtpRecords above). The remaining fields requested for the entry-level
// drill-down (HQ/EX/TOUR, route details, travel mode, route number, planned customers,
// sequence number, per-entry status) are read defensively below by checking a short list of
// likely column-name variants, so the UI still works correctly whichever variant the live
// `monthly_tour_entries` table actually uses. Nothing is invented: a field renders "-" if none
// of its candidate columns are present on the row. If real names differ, add them to the
// relevant candidate list.
type EntryRow = Record<string, unknown>;

function firstDefined(row: EntryRow, keys: string[]): unknown {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function toNullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mapEntryRow(row: EntryRow): MtpEntry {
  return {
    id: String(row.id ?? ""),
    programme_id: String(row.programme_id ?? ""),
    tour_date: String(row.tour_date ?? ""),
    day_type: toNullableString(firstDefined(row, ["day_type", "hq_ex_tour", "type", "visit_type"])),
    route_details: toNullableString(firstDefined(row, ["route_details", "route_detail", "route_description", "route"])),
    travel_mode: toNullableString(firstDefined(row, ["travel_mode", "mode_of_travel", "mode"])),
    route_number: toNullableString(firstDefined(row, ["route_number", "route_no", "route_code"])),
    total_km: Number(row.total_km ?? 0),
    planned_customers: toNullableNumber(firstDefined(row, ["planned_customers", "planned_customer_count", "customer_count", "planned_customers_count"])),
    sequence_number: toNullableNumber(firstDefined(row, ["sequence_number", "seq_no", "sequence", "sequence_no"])),
    status: toNullableString(firstDefined(row, ["status", "entry_status", "current_status"])),
  };
}

export async function getMtpProgrammeEntries(programmeId: string): Promise<MtpProgrammeEntriesResponse> {
  const { data, error } = await supabase
    .from("monthly_tour_entries")
    .select("*")
    .eq("programme_id", programmeId)
    .order("tour_date", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as EntryRow[];
  const entries = rows
    .map(mapEntryRow)
    .sort((a, b) => {
      const dateDiff = new Date(a.tour_date).getTime() - new Date(b.tour_date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (a.sequence_number ?? 0) - (b.sequence_number ?? 0);
    });

  const summary = {
    totalTourDays: new Set(entries.map((entry) => entry.tour_date)).size,
    totalRoutes: entries.length,
    totalKm: entries.reduce((total, entry) => total + Number(entry.total_km ?? 0), 0),
    totalPlannedCustomers: entries.reduce((total, entry) => total + Number(entry.planned_customers ?? 0), 0),
  };

  return { entries, summary };
}

export async function updateMtpStatus(id: string, status: MtpRecord["status"], remarks: string | null) {
  const { data, error } = await supabase
    .from("monthly_tour_programmes")
    .update({ status, remarks })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as MtpRecord;
}