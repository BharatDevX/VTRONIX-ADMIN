import { supabase } from "../../../services/supabase";

export async function getEmployee(authId: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}