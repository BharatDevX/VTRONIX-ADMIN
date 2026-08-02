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
    const { branch, designation, email, employee_id, full_name, mobile, password } = payload as {
      branch?: string;
      designation?: string;
      email?: string;
      employee_id?: string;
      full_name?: string;
      mobile?: string;
      password?: string;
    };

    if (!branch || !designation || !email || !employee_id || !full_name || !mobile || !password) {
      return jsonResponse({ error: { message: "Missing required employee fields." } }, 400);
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "employee",
      },
    });

    if (authError || !authData.user) {
      return jsonResponse({ error: { message: authError?.message ?? "Failed to create auth user." } }, 400);
    }

    const { data, error } = await supabaseAdmin
      .from("employees")
      .insert({
        auth_id: authData.user.id,
        branch,
        designation,
        email,
        employee_id,
        full_name,
        is_active: true,
        mobile,
        role: "employee",
      })
      .select()
      .single();

    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => undefined);
      return jsonResponse({ error: { message: error.message } }, 400);
    }

    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: { message: error instanceof Error ? error.message : "Unexpected error." } }, 400);
  }
});
