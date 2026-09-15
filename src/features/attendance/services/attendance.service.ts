import dayjs from "dayjs";
import { supabase } from "../../../services/supabase";
import {
  Attendance,
  MarkAttendancePayload,
} from "../types/attendance.types";

const MTP_NOT_CREATED_MESSAGE =
  "Please create and submit your Monthly Tour Programme before marking attendance.";

const MTP_NOT_SUBMITTED_MESSAGE =
  "Please submit your Monthly Tour Programme before marking attendance.";

async function ensureMonthlyTourProgrammeSubmitted(employeeId: string) {
  const today = dayjs();

  // 1st - 5th: no validation required.
  if (today.date() <= 5) {
    return;
  }

  const { data, error } = await supabase
    .from("monthly_tour_programmes")
    .select("submitted_at")
    .eq("employee_id", employeeId)
    .eq("month", today.month() + 1)
    .eq("year", today.year())
    .maybeSingle();

  if (error) {
    throw error;
  }

  // Case 1: no programme found at all.
  if (!data) {
    throw new Error(MTP_NOT_CREATED_MESSAGE);
  }

  // Case 2: programme exists but has not been submitted.
  if (!data.submitted_at) {
    throw new Error(MTP_NOT_SUBMITTED_MESSAGE);
  }

  // Case 3: programme exists and is_submitted is true — allow attendance.
}

export async function getTodayAttendance(
  employeeId: string
): Promise<Attendance | null> {
  const today = dayjs().format("YYYY-MM-DD");

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("attendance_date", today)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function markAttendance(
  payload: MarkAttendancePayload
): Promise<Attendance> {
  await ensureMonthlyTourProgrammeSubmitted(payload.employee_id);

  const today = dayjs();
  const now = today.toISOString();

  // Automatic attendance rules:
  // before 10:00 AM -> PRESENT
  // 10:00 AM to before 2:00 PM -> HALF_DAY
  // 2:00 PM onward -> LEAVE
  const minutesSinceMidnight = today.hour() * 60 + today.minute();

  const status =
    minutesSinceMidnight < 10 * 60
      ? "PRESENT"
      : minutesSinceMidnight < 14 * 60
        ? "HALF_DAY"
        : "LEAVE";

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      employee_id: payload.employee_id,
      attendance_date: today.format("YYYY-MM-DD"),
      check_in_time: now,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address ?? null,
      status,
      remarks: payload.remarks ?? null,
      working_minutes: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCurrentMonthAttendance(
  employeeId: string
): Promise<Attendance[]> {
  if (!employeeId) {
    return [];
  }

  const monthStart = dayjs().startOf("month").format("YYYY-MM-DD");
  const monthEnd = dayjs().endOf("month").format("YYYY-MM-DD");

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("attendance_date", monthStart)
    .lte("attendance_date", monthEnd)
    .order("attendance_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Attendance[];
}
