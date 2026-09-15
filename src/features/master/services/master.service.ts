import { supabase } from "../../../services/supabase";

export async function getDoctors() {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("is_active", true)
    .order("doctor_name");

  if (error) throw error;

  return data;
}

export async function getDealers() {
  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("is_active", true)
    .order("dealer_name");

  if (error) throw error;

  return data;
}

export async function getRetailers() {
  const { data, error } = await supabase
    .from("retailers")
    .select("*")
    .eq("is_active", true)
    .order("retailer_name");

  if (error) throw error;

  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("product_name");

  if (error) throw error;

  return data;
}
