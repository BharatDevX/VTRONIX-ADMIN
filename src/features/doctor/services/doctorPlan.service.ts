import dayjs from "dayjs";
import { supabase } from "../../../services/supabase";
import type { DoctorMeetingPlanForm } from "../types/doctorPlan.types";

export async function getPlans(employeeId: string) {
  const month = dayjs().month() + 1;
  const year = dayjs().year();

  const { data, error } = await supabase
    .from("doctor_meeting_plans")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("month", month)
    .eq("year", year)
    .order("planned_date");

  if (error) throw error;
  return data;
}

export async function createPlan(employeeId: string, form: DoctorMeetingPlanForm) {
  const month = dayjs().month() + 1;
  const year = dayjs().year();

  const { data: existing, error: existingError } = await supabase
    .from("doctor_meeting_plans")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("doctor_id", form.doctor_id)
    .eq("planned_date", form.planned_date)
    .maybeSingle();

  if (existingError) throw existingError;

  // discussion is retained in the DB for backward compatibility, but it is
  // intentionally no longer collected in the employee UI.
  const payload = {
    employee_id: employeeId,
    doctor_id: form.doctor_id,
    location: form.location,
    planned_date: form.planned_date,
    discussion: "",
    reply: form.reply?.trim() ? form.reply.trim() : null,
    month,
    year,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("doctor_meeting_plans")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return { data, isUpdate: true };
  }

  const { data, error } = await supabase
    .from("doctor_meeting_plans")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return { data, isUpdate: false };
}
