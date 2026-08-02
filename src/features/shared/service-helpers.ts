import { supabase } from "@/services/supabase";
import type { PaginatedQuery, PaginatedResponse } from "@/types/domain";

export async function listRecords<T>(
  table: string,
  params: PaginatedQuery,
  searchColumns: string[],
  options: { dateColumn?: string; orderColumn?: string } = {},
): Promise<PaginatedResponse<T>> {
  let query = supabase.from(table).select("*", { count: "exact" });

  if (params.search.trim()) {
    query = query.or(searchColumns.map((column) => `${column}.ilike.%${params.search}%`).join(","));
  }

  if (params.branch.trim()) {
    query = query.eq("branch", params.branch);
  }

  if (params.status.trim() && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  const { count, data, error } = await query
    .order(options.orderColumn ?? options.dateColumn ?? "created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    count: count ?? 0,
    data: (data ?? []) as T[],
  };
}

export async function updateRecord<T>(table: string, id: string, payload: Record<string, string | number | boolean | null>) {
  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as T;
}
