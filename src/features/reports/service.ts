import { supabase } from "@/services/supabase";

export interface ReportSummary {
  attendance: number;
  dealer: number;
  doctor: number;
  employees: number;
  mtp: number;
  sales: number;
}

async function countTable(table: string) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) {
    throw error;
  }
  return count ?? 0;
}

export async function getReportSummary(): Promise<ReportSummary> {
  const [attendance, dealer, doctor, employees, mtp, sales] = await Promise.all([
    countTable("attendance"),
    countTable("dealer_visits"),
    countTable("doctor_visits"),
    countTable("employees"),
    countTable("monthly_tour_programmes"),
    countTable("sales"),
  ]);

  return {
    attendance,
    dealer,
    doctor,
    employees,
    mtp,
    sales,
  };
}
