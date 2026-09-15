export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LEAVE"
  | "HALF_DAY";

export interface Attendance {
  id: string;

  employee_id: string;

  attendance_date: string;

  check_in_time: string | null;

  check_out_time: string | null;

  latitude: number;

  longitude: number;

  address: string | null;

  status: AttendanceStatus;

  remarks: string | null;

  working_minutes: number;

  created_at: string;

  updated_at: string;
}

export interface MarkAttendancePayload {
  employee_id: string;

  latitude: number;

  longitude: number;

  address?: string;

  status?: AttendanceStatus;

  remarks?: string;
}