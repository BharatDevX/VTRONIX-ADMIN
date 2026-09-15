import { getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { TrackingRecord } from "@/types/domain";

export interface JourneyPoint {
  id: string;
  employee_id: string;
  session_id: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  battery_level: number | null;
  address: string | null;
  recorded_at: string;
  distance_from_previous_km: number;
  cumulative_km: number;
}

interface LiveLocationRow {
  employee_id: string; latitude: number | null; longitude: number | null; accuracy: number | null;
  speed: number | null; heading: number | null; battery_level: number | null; is_working: boolean | null;
  updated_at: string | null; created_at: string | null;
}

export async function getLiveLocations() {
  const { data, error } = await supabase.from("employee_live_locations").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  const locations = (data ?? []) as LiveLocationRow[];
  const employeeIds = locations.map((location) => location.employee_id);
  const employees = await getEmployeesByIds(employeeIds);
  return locations.map((location): TrackingRecord | null => {
    if (location.latitude === null || location.longitude === null) return null;
    const employee = employees.get(location.employee_id);
    return {
      battery_percent: location.battery_level ?? null, branch: employee?.branch ?? "Unknown HQ", employee_id: location.employee_id,
      employee_name: employee?.full_name ?? "Unknown employee", employee_number: employee?.employee_id ?? location.employee_id,
      id: location.employee_id, is_working: location.is_working ?? false, latitude: location.latitude, longitude: location.longitude,
      updated_at: location.updated_at ?? location.created_at ?? new Date().toISOString(),
    };
  }).filter((location): location is TrackingRecord => location !== null);
}

export async function getEmployeeJourney(employeeId: string, date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const { data, error } = await supabase.from("employee_location_history").select("*").eq("employee_id", employeeId).gte("recorded_at", start.toISOString()).lt("recorded_at", end.toISOString()).order("recorded_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as JourneyPoint[];
}

export function subscribeToTracking(onChange: () => void) {
  // Use a unique channel for every subscription. The tracking page can have
  // multiple realtime subscriptions mounted at the same time (live locations
  // + the selected employee journey). Reusing one channel topic can cause
  // Supabase Realtime to receive `.on()` calls after that channel has already
  // been subscribed, which crashes the page in the browser.
  const channelName = `vetronix-live-tracking-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "employee_live_locations" },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "employee_location_history" },
      onChange,
    );

  void channel.subscribe((status) => {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      // Realtime is an enhancement; polling in the React Query hooks continues
      // to keep the tracking screen usable even if Realtime is unavailable.
      console.warn(`Tracking realtime channel ${status.toLowerCase()}.`);
    }
  });

  return () => {
    void supabase.removeChannel(channel);
  };
}
