import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.8";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
function jsonResponse(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } }); }
function normalizeOptional(value?: string | null) { const trimmed = value?.trim(); return trimmed ? trimmed : null; }
function normalizeHeadQuarters(values?: unknown, fallback?: string | null) { const list = Array.isArray(values) ? values : []; const normalized = list.map((value) => String(value).trim()).filter(Boolean); const fallbackValue = normalizeOptional(fallback); if (fallbackValue) normalized.push(fallbackValue); return Array.from(new Set(normalized)); }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabaseUrl = Deno.env.get("SUPABASE_URL"); const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: { message: "Missing Supabase service role environment variables." } }, 500);
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    const payload = await req.json();
    const { branch, head_quarters, designation, email, employee_id, full_name, mobile, password } = payload as { branch?: string | null; head_quarters?: unknown; designation?: string; email?: string | null; employee_id?: string; full_name?: string; mobile?: string; password?: string };
    const normalizedEmployeeId = employee_id?.trim(); const normalizedFullName = full_name?.trim(); const normalizedDesignation = designation?.trim();
    const normalizedBranch = normalizeOptional(branch); const normalizedEmail = normalizeOptional(email); const normalizedMobile = mobile?.trim(); const normalizedPassword = password; const normalizedHeadQuarters = normalizeHeadQuarters(head_quarters, normalizedBranch);
    if (!normalizedEmployeeId || !normalizedFullName || !normalizedDesignation || !normalizedMobile || !normalizedPassword) return jsonResponse({ error: { message: "Employee ID, full name, designation, mobile and password are required." } }, 400);
    const authEmail = normalizedEmail ?? `${normalizedEmployeeId.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@auth.vetronix.local`;
    const { data: existingEmployee } = await supabaseAdmin.from("employees").select("id").eq("employee_id", normalizedEmployeeId).maybeSingle();
    if (existingEmployee) return jsonResponse({ error: { message: "Employee ID already exists." } }, 409);
    if (normalizedEmail) { const { data: existingEmail } = await supabaseAdmin.from("employees").select("id").eq("email", normalizedEmail).maybeSingle(); if (existingEmail) return jsonResponse({ error: { message: "This email is already assigned to an employee." } }, 409); }
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({ email: authEmail, password: normalizedPassword, email_confirm: true, user_metadata: { role: "employee", employee_id: normalizedEmployeeId } });
    if (authError || !authData.user) return jsonResponse({ error: { message: authError?.message ?? "Failed to create auth user." } }, 400);
    const { data, error } = await supabaseAdmin.from("employees").insert({ auth_id: authData.user.id, employee_id: normalizedEmployeeId, full_name: normalizedFullName, designation: normalizedDesignation, branch: normalizedHeadQuarters[0] ?? normalizedBranch, head_quarters: normalizedHeadQuarters, email: normalizedEmail, auth_email: authEmail, mobile: normalizedMobile, is_active: true, role: "employee" }).select().single();
    if (error) { await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => undefined); return jsonResponse({ error: { message: error.message } }, 400); }
    return jsonResponse(data);
  } catch (error) { return jsonResponse({ error: { message: error instanceof Error ? error.message : "Unexpected error." } }, 400); }
});
