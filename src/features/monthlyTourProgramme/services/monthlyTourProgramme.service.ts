import { supabase } from "../../../services/supabase";

import {
  MonthlyTourProgramme,
  MonthlyTourProgrammeWithEntries,
  MonthlyTourEntry,
} from "../types/monthlyTourProgramme.types";

export class MonthlyTourProgrammeService {
  // -----------------------------
  // Programme
  // -----------------------------

  static async createProgramme(payload: {
    employee_id: string;
    month: number;
    year: number;
    designation?: string | null;
    hq?: string | null;
  }) {
    const { data, error } = await supabase
  .from("monthly_tour_programmes")
  .insert({
    ...payload,
    status: "draft",
    is_submitted: false,
  })
  .select()
  .single();

if (error) {
  console.log("CREATE PROGRAMME ERROR");
  console.log(error);
  throw error;
}
    return data as MonthlyTourProgramme;
  }

  static async getProgramme(
    employeeId: string,
    month: number,
    year: number
  ) {
    const { data, error } = await supabase
      .from("monthly_tour_programmes")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (error) throw error;

    return data as MonthlyTourProgramme | null;
  }

  static async updateProgramme(
    id: string,
    payload: Partial<MonthlyTourProgramme>
  ) {
    const { data, error } = await supabase
      .from("monthly_tour_programmes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as MonthlyTourProgramme;
  }

  static async submitProgramme(id: string) {
    const { data, error } = await supabase
      .from("monthly_tour_programmes")
      .update({
    status: "submitted",
    is_submitted: true,
    submitted_at: new Date().toISOString(),
})
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as MonthlyTourProgramme;
  }

  // -----------------------------
  // Entries
  // -----------------------------

  static async getEntries(programmeId: string) {
    const { data, error } = await supabase
      .from("monthly_tour_entries")
      .select("*")
      .eq("programme_id", programmeId)
      .order("tour_date", { ascending: true })
      .order("sequence_no", { ascending: true });

    if (error) throw error;

    return (data ?? []) as MonthlyTourEntry[];
  }

  static async addEntry(
    payload: Omit<
      MonthlyTourEntry,
      "id" | "created_at" | "updated_at"
    >
  ) {
    const { data, error } = await supabase
      .from("monthly_tour_entries")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data as MonthlyTourEntry;
  }

  static async updateEntry(
    id: string,
    payload: Partial<MonthlyTourEntry>
  ) {
    const { data, error } = await supabase
      .from("monthly_tour_entries")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as MonthlyTourEntry;
  }

  static async deleteEntry(id: string) {
    const { error } = await supabase
      .from("monthly_tour_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // -----------------------------
  // Complete Programme
  // -----------------------------

  static async getProgrammeWithEntries(
    employeeId: string,
    month: number,
    year: number
  ): Promise<MonthlyTourProgrammeWithEntries | null> {
    const programme = await this.getProgramme(
      employeeId,
      month,
      year
    );

    if (!programme) return null;

    const entries = await this.getEntries(programme.id);

    return {
      ...programme,
      entries,
    };
  }

  // -----------------------------
  // Summary
  // -----------------------------

  static calculateSummary(entries: MonthlyTourEntry[]) {
    const uniqueDays = new Set(
      entries.map((e) => e.tour_date)
    );

    return {
      plannedDays: uniqueDays.size,

      totalTours: entries.length,

      totalKm: entries.reduce(
        (sum, e) => sum + Number(e.total_km),
        0
      ),

    };
  }
}