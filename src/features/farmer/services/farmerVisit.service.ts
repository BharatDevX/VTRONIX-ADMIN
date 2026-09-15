import { supabase } from "../../../services/supabase";
import type { FarmerVisitForm } from "../types/farmerVisit.types";

function toFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("duplicate") || message.includes("already exists") || message.includes("unique")) {
    return new Error("This farmer visit already exists. It was not duplicated.");
  }
  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return new Error("Network issue. Please check your connection and try again.");
  }
  return new Error("Unable to save the farmer visit right now.");
}

export async function getFarmerVisits(employeeId: string) {
  const { data, error } = await supabase
    .from("farmer_visits")
    .select("*")
    .eq("employee_id", employeeId)
    .order("visit_date", { ascending: false });
  if (error) throw toFriendlyError(error);
  return data ?? [];
}

export async function saveFarmerVisit(employeeId: string, form: FarmerVisitForm) {
  const normalizedName = form.farmer_name.trim();
  const { data: existing, error: existingError } = await supabase
    .from("farmer_visits")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("farmer_name", normalizedName)
    .eq("visit_date", form.visit_date)
    .eq("visit_time", form.visit_time)
    .maybeSingle();

  if (existingError) throw toFriendlyError(existingError);

  const payload = {
    employee_id: employeeId,
    farmer_name: normalizedName,
    visit_date: form.visit_date,
    visit_time: form.visit_time,
    location: form.location.trim(),
    discussion: form.discussion.trim(),
    outcome: form.outcome.trim(),
    next_followup_date: form.next_followup_date,
  };

  if (existing?.id) {
    const { data, error } = await supabase.from("farmer_visits").update(payload).eq("id", existing.id).select().single();
    if (error) throw toFriendlyError(error);
    return { data, isUpdate: true };
  }

  const { data, error } = await supabase.from("farmer_visits").insert(payload).select().single();
  if (error) throw toFriendlyError(error);
  return { data, isUpdate: false };
}
