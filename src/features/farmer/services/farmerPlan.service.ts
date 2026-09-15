import dayjs from "dayjs";
import { supabase } from "../../../services/supabase";
import type { FarmerMeetingPlanForm } from "../types/farmerPlan.types";

export async function createFarmerPlan(employeeId: string, form: FarmerMeetingPlanForm) {
  const month = dayjs().month() + 1;
  const year = dayjs().year();

  const { data: existing, error: existingError } = await supabase
    .from("farmer_meeting_plans")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("farmer_name", form.farmer_name.trim())
    .eq("planned_date", form.planned_date)
    .maybeSingle();

  if (existingError) throw existingError;

  const payload = {
    employee_id: employeeId,
    farmer_name: form.farmer_name.trim(),
    location: form.location.trim(),
    planned_date: form.planned_date,
    note: form.note.trim() || null,
    month,
    year,
    is_submitted: true,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("farmer_meeting_plans")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return { data, isUpdate: true };
  }

  const { data, error } = await supabase
    .from("farmer_meeting_plans")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return { data, isUpdate: false };
}
