import { supabase } from "@/services/supabase";

export type EmployeeMessageType = "info" | "warning" | "alert" | "order";

const titles: Record<EmployeeMessageType, string> = {
  info: "Information from Admin",
  warning: "Warning from Admin",
  alert: "Alert from Admin",
  order: "Order from Admin",
};

export async function sendEmployeeMessage(params: {
  employeeId: string;
  message: string;
  type: EmployeeMessageType;
}) {
  const message = params.message.trim();

  if (!message) {
    throw new Error("Please enter a message.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const adminId = sessionData.session?.user.id;

  if (!adminId) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  const { data: admin, error: adminError } = await supabase
    .from("employees")
    .select("id, role")
    .eq("auth_id", adminId)
    .single();

  if (adminError || !admin || admin.role !== "admin") {
    throw new Error("Only an authorized admin can send employee messages.");
  }

  const { data, error } = await supabase
    .from("employee_admin_messages")
    .insert({
      employee_id: params.employeeId,
      sender_admin_id: admin.id,
      message,
      message_type: params.type,
      title: titles[params.type],
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


export interface EmployeeAdminMessageRecord {
  id: string;
  employee_id: string;
  sender_admin_id: string | null;
  title: string;
  message: string;
  message_type: EmployeeMessageType;
  created_at: string;
  status: "pending" | "done";
  done_at: string | null;
}

export async function getEmployeeAdminMessages(employeeId: string): Promise<EmployeeAdminMessageRecord[]> {
  const { data, error } = await supabase
    .from("employee_admin_messages")
    .select("id, employee_id, sender_admin_id, title, message, message_type, created_at, status, done_at")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EmployeeAdminMessageRecord[];
}
