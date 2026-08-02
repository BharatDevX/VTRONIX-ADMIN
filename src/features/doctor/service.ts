import { getDoctorsByIds, getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { PaginatedQuery, PaginatedResponse, VisitRecord } from "@/types/domain";

interface DoctorVisitRow {
  discussion: string | null;
  doctor_id: string;
  employee_id: string;
  id: string;
  location: string | null;
  next_followup_date: string | null;
  remarks: string | null;
  visit_date: string;
  visit_time: string | null;
}

export async function getDoctorVisits(params: PaginatedQuery): Promise<PaginatedResponse<VisitRecord>> {
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
      return {
        branch: employee?.branch ?? "-",
        city: row.location ?? "-",
        employee_id: row.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        entity_name: doctor?.doctor_name ?? "Unknown doctor",
        id: row.id,
        next_action: row.next_followup_date,
        outcome: row.discussion ?? row.remarks ?? "-",
        visit_date: row.visit_date,
        visit_time: row.visit_time,
      };
    })
    .filter((row) => {
      const search = params.search.trim().toLowerCase();
      const haystack = `${row.employee_name} ${row.entity_name} ${row.city} ${row.outcome} ${row.branch}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesBranch = !params.branch.trim() || row.branch.toLowerCase() === params.branch.trim().toLowerCase();
      return matchesSearch && matchesBranch;
    });

  return {
    count: count ?? mapped.length,
    data: mapped,
  };
}
