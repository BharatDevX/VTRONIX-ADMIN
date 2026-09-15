import { supabase } from "../../../services/supabase";

export async function login(
  employeeId: string,
  password: string
) {
  const {
    data: employee,
    error: employeeError,
  } = await supabase
    .from("employees")
    .select("email, auth_email")
    .eq("employee_id", employeeId)
    .single();

  if (employeeError || !employee) {
    throw new Error("Invalid Employee ID");
  }

  const authEmail = employee.auth_email ?? employee.email;

  if (!authEmail) {
    throw new Error(
      "Employee login account is not configured. Please contact admin."
    );
  }

  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}