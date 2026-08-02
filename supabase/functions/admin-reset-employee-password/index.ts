import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: { message: "Missing Supabase service role environment variables." } }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const payload = await req.json();
    const { employeeId } = payload as { employeeId?: string };

    if (!employeeId) {
      return jsonResponse({ error: { message: "Employee id is required." } }, 400);
    }

    const { data: employeeRow, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("auth_id")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employeeRow?.auth_id) {
      return jsonResponse({ error: { message: employeeError?.message ?? "Employee auth profile not found." } }, 400);
    }

    const tempPassword = `Temp${Math.random().toString(36).slice(2, 8)}!`;
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(employeeRow.auth_id, {
      password: tempPassword,
    });

    if (updateError) {
      return jsonResponse({ error: { message: updateError.message } }, 400);
    }

    return jsonResponse({ temporaryPassword: tempPassword });
  } catch (error) {
    return jsonResponse({ error: { message: error instanceof Error ? error.message : "Unexpected error." } }, 400);
  }
});
