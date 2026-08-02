import { supabase } from "@/services/supabase";
import type { NotificationRecord } from "@/types/domain";

export async function getNotifications() {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) {
    throw error;
  }
  return data as NotificationRecord[];
}

export async function markNotificationRead(id: string, is_read: boolean) {
  const { data, error } = await supabase.from("notifications").update({ is_read }).eq("id", id).select().single();
  if (error) {
    throw error;
  }
  return data as NotificationRecord;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) {
    throw error;
  }
}
