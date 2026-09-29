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
  employee_id: string;
  session_id: string | null;
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

export interface TrackingSummary {
  todayKm: number;
  monthKm: number;
  vehicleType: string | null;
}

export interface TrackingPdfData {
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  middleLocations: string[];
  endLocation: string;
  totalKm: number;
  totalMonthlyKm: number;
  vehicleType: string;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateFromTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return localDateString(date);
}

function startOfLocalDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function monthStartLocal(date: Date) {
  const value = new Date(date.getFullYear(), date.getMonth(), 1);
  value.setHours(0, 0, 0, 0);
  return value;
}


function addOneDay(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

async function getVehicleType(employeeId: string, date = new Date()) {
  const visitDate = localDateString(date);
  const tables = ["doctor_visits", "dealer_visits", "farmer_visits"] as const;

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("vehicle_type, visit_date, visit_time, created_at")
      .eq("employee_id", employeeId)
      .eq("visit_date", visitDate)
      .not("vehicle_type", "is", null)
      .order("visit_time", { ascending: false })
      .limit(1);

    if (error) {
      // Keep tracking usable if one legacy visit table does not yet expose
      // vehicle_type. The other visit tables can still provide it.
      continue;
    }

    const value = data?.[0]?.vehicle_type;
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}

export async function getLiveLocations() {
  const { data, error } = await supabase
    .from("employee_live_locations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const locations = (data ?? []) as LiveLocationRow[];
  const employeeIds = locations.map((location) => location.employee_id);
  const employees = await getEmployeesByIds(employeeIds);

  return locations
    .map((location): TrackingRecord | null => {
      if (location.latitude === null || location.longitude === null) return null;

      const employee = employees.get(location.employee_id);

      return {
        battery_percent: location.battery_level ?? null,
        branch: employee?.branch ?? "Unknown HQ",
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

export async function getEmployeeJourney(employeeId: string, date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = addOneDay(start);

  const { data, error } = await supabase
    .from("employee_location_history")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("recorded_at", start.toISOString())
    .lt("recorded_at", end.toISOString())
    .order("recorded_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as JourneyPoint[];
}

export async function getEmployeeTrackingSummary(
  employeeId: string,
  date = new Date(),
): Promise<TrackingSummary> {
  const today = localDateString(date);
  const monthStart = monthStartLocal(date);
  const tomorrow = addOneDay(startOfLocalDay(date));

  // Use the completed work session as the authoritative final distance.
  // employee_location_history is intentionally checkpoint-based (~5 km), so
  // its latest cumulative_km can lag behind the final work-session distance
  // when the final checkpoint write is delayed/missed.
  const [{ data: history, error: historyError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      supabase
        .from("employee_location_history")
        .select("session_id, cumulative_km, recorded_at")
        .eq("employee_id", employeeId)
        .gte("recorded_at", monthStart.toISOString())
        .lt("recorded_at", tomorrow.toISOString())
        .order("recorded_at", { ascending: true }),
      supabase
        .from("work_sessions")
        .select("id, work_date, status, total_km")
        .eq("employee_id", employeeId)
        .gte("work_date", today.slice(0, 7) + "-01")
        .lt("work_date", tomorrow.toISOString().slice(0, 10)),
    ]);

  if (historyError) throw historyError;
  if (sessionsError) throw sessionsError;

  // For an active session, history is the best live estimate. Once the
  // employee ends work, work_sessions.total_km is the authoritative final
  // value written by the Employee App.
  const historySessionTotals = new Map<string, number>();
  let legacyTotal = 0;
  let historyTodayKm = 0;

  for (const row of history ?? []) {
    const value = Number(row.cumulative_km ?? 0);
    const recordedDate = row.recorded_at
      ? localDateFromTimestamp(String(row.recorded_at))
      : "";
    const sessionId = row.session_id ? String(row.session_id) : null;

    if (sessionId) {
      historySessionTotals.set(
        sessionId,
        Math.max(historySessionTotals.get(sessionId) ?? 0, value),
      );
    } else {
      legacyTotal = Math.max(legacyTotal, value);
    }

    if (recordedDate === today) {
      historyTodayKm = Math.max(historyTodayKm, value);
    }
  }

  let activeTodayKm = historyTodayKm;

  for (const session of sessions ?? []) {
    const value = Number(session.total_km ?? 0);

    if (session.work_date === today && session.status === "completed") {
      activeTodayKm = Number.isFinite(value) ? value : historyTodayKm;
    }
  }

  const monthKm = (sessions ?? []).reduce((sum, session) => {
    const value = Number(session.total_km ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0) + legacyTotal;

  return {
    todayKm: Number(activeTodayKm.toFixed(2)),
    monthKm: Number(monthKm.toFixed(2)),
    vehicleType: await getVehicleType(employeeId, date),
  };
}

export async function getLiveTrackingReportRows(date = new Date()) {
  const startDate = localDateString(date);
  const start = startOfLocalDay(date);
  const tomorrow = addOneDay(start);
  const monthStart = monthStartLocal(date);

  const [
    { data: employees, error: employeesError },
    { data: history, error: historyError },
    { data: workSessions, error: workSessionsError },
  ] = await Promise.all([
    supabase.from("employees").select("id, full_name, employee_id").eq("is_active", true).order("full_name"),
    supabase
      .from("employee_location_history")
      .select("employee_id, session_id, latitude, longitude, address, cumulative_km, recorded_at")
      .gte("recorded_at", monthStart.toISOString())
      .lt("recorded_at", tomorrow.toISOString())
      .order("recorded_at", { ascending: true }),
    supabase
      .from("work_sessions")
      .select("employee_id, work_date, status, total_km")
      .gte("work_date", monthStart.toISOString().slice(0, 10))
      .lt("work_date", tomorrow.toISOString().slice(0, 10)),
  ]);

  if (employeesError) throw employeesError;
  if (historyError) throw historyError;
  if (workSessionsError) throw workSessionsError;

  const employeeMap = new Map((employees ?? []).map((employee) => [String(employee.id), employee]));
  const rowsByEmployee = new Map<string, {
    employee_id: string;
    employee_name: string;
    date: string;
    first_location: string;
    middle_locations: string;
    last_location: string;
    total_km_today: number;
    total_km_month: number;
  }>();

  const sessionTotals = new Map<string, number>();
  const monthLegacyTotals = new Map<string, number>();

  for (const point of history ?? []) {
    const employeeId = String(point.employee_id);
    const value = Number(point.cumulative_km ?? 0);
    const sessionId = point.session_id ? String(point.session_id) : null;

    if (sessionId) {
      sessionTotals.set(`${employeeId}:${sessionId}`, Math.max(sessionTotals.get(`${employeeId}:${sessionId}`) ?? 0, value));
    } else {
      monthLegacyTotals.set(employeeId, Math.max(monthLegacyTotals.get(employeeId) ?? 0, value));
    }

    if (localDateFromTimestamp(String(point.recorded_at)) !== startDate) continue;

    const row = rowsByEmployee.get(employeeId);
    const location = String(point.address || `${Number(point.latitude).toFixed(5)}, ${Number(point.longitude).toFixed(5)}`);

    if (!row) {
      rowsByEmployee.set(employeeId, {
        employee_id: employeeId,
        employee_name: String(employeeMap.get(employeeId)?.full_name ?? "Unknown employee"),
        date: startDate,
        first_location: location,
        middle_locations: "",
        last_location: location,
        total_km_today: value,
        total_km_month: 0,
      });
    } else {
      row.last_location = location;
      row.total_km_today = Math.max(row.total_km_today, value);
    }
  }

  for (const [employeeId, row] of rowsByEmployee) {
    const historyMonthKm = Array.from(sessionTotals.entries())
      .filter(([key]) => key.startsWith(`${employeeId}:`))
      .reduce((sum, [, value]) => sum + value, 0) + (monthLegacyTotals.get(employeeId) ?? 0);

    const employeeSessions = (workSessions ?? []).filter(
      (session) => String(session.employee_id) === employeeId,
    );
    const completedMonthKm = employeeSessions.reduce((sum, session) => {
      const value = Number(session.total_km ?? 0);
      return sum + (session.status === "completed" && Number.isFinite(value) ? value : 0);
    }, 0);
    const completedToday = employeeSessions.find(
      (session) => session.work_date === startDate && session.status === "completed",
    );

    const todayPoints = (history ?? [])
      .filter((point) => String(point.employee_id) === employeeId && localDateFromTimestamp(String(point.recorded_at)) === startDate)
      .map((point) => String(point.address || `${Number(point.latitude).toFixed(5)}, ${Number(point.longitude).toFixed(5)}`));

    row.middle_locations = todayPoints.length > 2
      ? todayPoints.slice(1, -1).join(" → ")
      : "—";

    // Completed work_sessions are authoritative for final totals; history is
    // used while a session is still active.
    if (completedToday) {
      const finalTodayKm = Number(completedToday.total_km ?? 0);
      if (Number.isFinite(finalTodayKm)) {
        row.total_km_today = finalTodayKm;
      }
    }

    const monthKm = completedMonthKm > 0 ? completedMonthKm : historyMonthKm;
    row.total_km_today = Number(row.total_km_today.toFixed(2));
    row.total_km_month = Number(monthKm.toFixed(2));
  }

  const vehicleTypes = await Promise.all(
    Array.from(rowsByEmployee.keys()).map(async (employeeId) => [employeeId, await getVehicleType(employeeId, date)] as const),
  );

  const vehicleMap = new Map(vehicleTypes);

  return Array.from(rowsByEmployee.values()).map((row) => ({
    ...row,
    vehicle_type: vehicleMap.get(row.employee_id) ?? "—",
  }));
}

export async function getEmployeeTrackingPdfData(
  employeeId: string,
  date = new Date(),
): Promise<TrackingPdfData> {
  const workDate = localDateString(date);
  const [employeesResult, sessionsResult, journey, summary] = await Promise.all([
    supabase.from("employees").select("id, full_name").eq("id", employeeId).maybeSingle(),
    supabase
      .from("work_sessions")
      .select("start_time, end_time, start_latitude, start_longitude, end_latitude, end_longitude, total_km, status")
      .eq("employee_id", employeeId)
      .eq("work_date", workDate)
      .order("start_time", { ascending: false }),
    getEmployeeJourney(employeeId, date),
    getEmployeeTrackingSummary(employeeId, date),
  ]);

  if (employeesResult.error) throw employeesResult.error;
  if (sessionsResult.error) throw sessionsResult.error;

  const session = (sessionsResult.data ?? [])[0] as {
    start_time: string | null;
    end_time: string | null;
    start_latitude: number | null;
    start_longitude: number | null;
    end_latitude: number | null;
    end_longitude: number | null;
    total_km: number | null;
    status: string | null;
  } | undefined;

  const points = [...journey].sort(
    (left, right) => new Date(left.recorded_at).getTime() - new Date(right.recorded_at).getTime(),
  );

  const locationText = (point: JourneyPoint | undefined) =>
    point?.address || (point ? `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : "—");

  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const middleLocations = points.length > 2
    ? points.slice(1, -1).map(locationText)
    : [];

  const formatCoordinate = (latitude: number | null, longitude: number | null) =>
    latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : "—";

  const startLocation = startPoint
    ? locationText(startPoint)
    : formatCoordinate(session?.start_latitude ?? null, session?.start_longitude ?? null);
  const endLocation = endPoint
    ? locationText(endPoint)
    : formatCoordinate(session?.end_latitude ?? null, session?.end_longitude ?? null);

  const sessionTotalKm = Number(session?.total_km ?? 0);
  const totalKm = summary.todayKm > 0 ? summary.todayKm : sessionTotalKm;

  return {
    employeeName: String(employeesResult.data?.full_name ?? "Unknown employee"),
    date: workDate,
    startTime: session?.start_time ? formatDateTimeForPdf(session.start_time) : "—",
    endTime: session?.end_time ? formatDateTimeForPdf(session.end_time) : "—",
    startLocation,
    middleLocations,
    endLocation,
    totalKm: Number(totalKm.toFixed(2)),
    totalMonthlyKm: Number(summary.monthKm.toFixed(2)),
    vehicleType: summary.vehicleType ?? "—",
  };
}

function formatDateTimeForPdf(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function subscribeToTracking(onChange: () => void) {
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
      console.warn(`Tracking realtime channel ${status.toLowerCase()}.`);
    }
  });

  return () => {
    void supabase.removeChannel(channel);
  };
}
