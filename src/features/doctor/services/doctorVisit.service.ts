import { supabase } from "../../../services/supabase";

import type { DoctorVisitForm } from "../types/doctoVisit.types";

async function replaceProductMappings(
  table: string,
  foreignKey: string,
  recordId: string,
  productIds: string[]
) {
  const uniqueProductIds = Array.from(
    new Set((productIds ?? []).filter(Boolean))
  );

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq(foreignKey, recordId);

  if (deleteError) throw deleteError;

  if (uniqueProductIds.length === 0) return;

  const rows = uniqueProductIds.map((product_id) => ({
    [foreignKey]: recordId,
    product_id,
  }));

  const { error: insertError } = await supabase.from(table).insert(rows);

  if (insertError) throw insertError;
}

export async function getDoctorVisits(employeeId: string) {
  const { data, error } = await supabase
    .from("doctor_visits")
    .select("*")
    .eq("employee_id", employeeId)
    .order("visit_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function saveDoctorVisit(employeeId: string, form: DoctorVisitForm) {
  const { data: existing, error: existingError } = await supabase
    .from("doctor_visits")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("doctor_id", form.doctor_id)
    .eq("visit_date", form.visit_date)
    .eq("visit_time", form.visit_time)
    .maybeSingle();

  if (existingError) throw existingError;

  const payload = {
    employee_id: employeeId,
    doctor_id: form.doctor_id,
    visit_date: form.visit_date,
    visit_time: form.visit_time,
    location: form.location,
    discussion: form.discussion,
    remarks: form.remarks,
    next_followup_date: form.next_followup_date,
    latitude: form.latitude,
    longitude: form.longitude,
  };

  let savedRecord: any;
  let isUpdate = false;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("doctor_visits")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;

    savedRecord = data;
    isUpdate = true;
  } else {
    const { data, error } = await supabase
      .from("doctor_visits")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    savedRecord = data;
  }

  await replaceProductMappings(
    "doctor_visit_products",
    "visit_id",
    savedRecord.id,
    form.product_ids
  );

  return { data: savedRecord, isUpdate };
}