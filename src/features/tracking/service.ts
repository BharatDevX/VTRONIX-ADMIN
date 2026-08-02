import { getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";
import type { TrackingRecord } from "@/types/domain";

interface LiveLocationRow {
  employee_id: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  battery_level: number | null;
  is_working: boolean | null;
  updated_at: string | null;
  created_at: string | null;
}

export async function getLiveLocations() {
  const { data, error } = await supabase
    .from("employee_live_locations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const locations = (data ?? []) as LiveLocationRow[];
  const employeeIds = locations.map((location) => location.employee_id);
  const employees = await getEmployeesByIds(employeeIds);

  return locations
    .map((location): TrackingRecord | null => {
      if (location.latitude === null || location.longitude === null) {
        return null;
      }

      const employee = employees.get(location.employee_id);

      return {
        battery_percent: location.battery_level ?? null,
        branch: employee?.branch ?? "Unknown branch",
        employee_id: location.employee_id,
        employee_name: employee?.full_name ?? "Unknown employee",
        employee_number: employee?.employee_id ?? location.employee_id,
        id: location.employee_id,
        is_working: location.is_working ?? false,
        latitude: location.latitude,
        longitude: location.longitude,
        updated_at: location.updated_at ?? location.created_at ?? new Date().toISOString(),
      };
    })
    .filter((location): location is TrackingRecord => location !== null);
}
