import { supabase } from "../../../services/supabase";
import type { DealerVisitForm } from "../types/dealerVisit.types";

function toFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("duplicate") || message.includes("already exists") || message.includes("unique")) {
    return new Error("This dealer visit already exists. It was not duplicated.");
  }

  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return new Error("Network issue. Please check your connection and try again.");
  }

  if (message.includes("validation") || message.includes("required")) {
    return new Error("Please complete the required fields before saving.");
  }

  return new Error("Unable to save the dealer visit right now.");
}

export async function getDealerVisits(employeeId: string) {
  const { data, error } = await supabase
    .from("dealer_visits")
    .select("*")
    .eq("employee_id", employeeId)
    .order("visit_date", { ascending: false });

  if (error) throw toFriendlyError(error);

  return data;
}

export async function saveDealerVisit(employeeId: string, form: DealerVisitForm) {
  const { data: existing, error: existingError } = await supabase
    .from("dealer_visits")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("dealer_id", form.dealer_id)
    .eq("visit_date", form.visit_date)
    .maybeSingle();

  if (existingError) throw toFriendlyError(existingError);

  const payload = {
    employee_id: employeeId,
    dealer_id: form.dealer_id,
    visit_date: form.visit_date,
    visit_time: form.visit_time,
    location: form.location,
    discussion: form.discussion,
    outcome: form.outcome,
    next_followup_date: form.next_followup_date,
    latitude: form.latitude,
    longitude: form.longitude,
  };

  let savedRecord: any;
  let isUpdate = false;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("dealer_visits")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw toFriendlyError(error);

    savedRecord = data;
    isUpdate = true;
  } else {
    const { data, error } = await supabase
      .from("dealer_visits")
      .insert(payload)
      .select()
      .single();

    if (error) throw toFriendlyError(error);

    savedRecord = data;
  }

  return { data: savedRecord, isUpdate };
}