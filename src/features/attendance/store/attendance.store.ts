import { create } from "zustand";

import { Attendance } from "../types/attendance.types";

interface AttendanceState {
  todayAttendance: Attendance | null;

  loading: boolean;

  setTodayAttendance: (
    attendance: Attendance | null
  ) => void;

  setLoading: (loading: boolean) => void;
}

export const useAttendanceStore =
  create<AttendanceState>((set) => ({
    todayAttendance: null,

    loading: false,

    setTodayAttendance: (attendance) =>
      set({
        todayAttendance: attendance,
      }),

    setLoading: (loading) =>
      set({
        loading,
      }),
  }));