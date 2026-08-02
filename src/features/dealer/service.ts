import { getDealersByIds, getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { PaginatedQuery, PaginatedResponse, VisitRecord } from "@/types/domain";

interface DealerVisitRow {
  dealer_id: string;
  discussion: string | null;
  employee_id: string;
  id: string;
  location: string | null;
  next_followup_date: string | null;
  outcome: string | null;
  visit_date: string;
  visit_time: string | null;
}

export async function getDealerVisits(params: PaginatedQuery): Promise<PaginatedResponse<VisitRecord>> {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  const { count, data, error } = await supabase
    .from("dealer_visits")
    .select("*", { count: "exact" })
    .order("visit_date", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as DealerVisitRow[];
  const [employees, dealers] = await Promise.all([
    getEmployeesByIds(rows.map((row) => row.employee_id)),
    getDealersByIds(rows.map((row) => row.dealer_id)),
  ]);

  const mapped = rows
    .map((row) => {
      const employee = employees.get(row.employee_id);
      const dealer = dealers.get(row.dealer_id);
      return {
        branch: employee?.branch ?? "-",
        city: row.location ?? "-",
        employee_id: row.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        entity_name: dealer?.dealer_name ?? "Unknown dealer",
        id: row.id,
        next_action: row.next_followup_date,
        outcome: row.outcome ?? row.discussion ?? "-",
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
