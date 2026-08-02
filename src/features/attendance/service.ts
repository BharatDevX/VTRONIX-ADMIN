import { getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { AttendanceRecord, ExistingAttendanceStatus, PaginatedQuery, PaginatedResponse } from "@/types/domain";

interface AttendanceRow {
  address: string | null;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  employee_id: string;
  id: string;
  status: ExistingAttendanceStatus;
  working_minutes: number;
}

export async function getAttendance(params: PaginatedQuery): Promise<PaginatedResponse<AttendanceRecord>> {
  let query = supabase.from("attendance").select("*", { count: "exact" });

  if (params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  const { count, data, error } = await query.order("attendance_date", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as AttendanceRow[];
  const employees = await getEmployeesByIds(rows.map((row) => row.employee_id));

  const mapped = rows
    .map((row) => {
      const employee = employees.get(row.employee_id);
      return {
        address: row.address,
        attendance_date: row.attendance_date,
        branch: employee?.branch ?? "-",
        check_in_time: row.check_in_time,
        check_out_time: row.check_out_time,
        employee_id: row.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        id: row.id,
        status: row.status,
        total_km: 0,
        working_minutes: row.working_minutes,
      };
    })
    .filter((row) => {
      const search = params.search.trim().toLowerCase();
      const matchesSearch = !search || `${row.employee_name} ${row.branch} ${row.status}`.toLowerCase().includes(search);
      const matchesBranch = !params.branch.trim() || row.branch.toLowerCase() === params.branch.trim().toLowerCase();
      return matchesSearch && matchesBranch;
    });

  return {
    count: count ?? mapped.length,
    data: mapped,
  };
}
