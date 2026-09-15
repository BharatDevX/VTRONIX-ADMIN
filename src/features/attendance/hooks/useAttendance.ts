import { useState } from "react";
import * as Location from "expo-location";

import {
  getTodayAttendance,
  markAttendance,
} from "../services/attendance.service";

import { useAttendanceStore } from "../store/attendance.store";
import { MarkAttendancePayload } from "../types/attendance.types";

export function useAttendance() {
  const [loading, setLoading] = useState(false);

  const {
    todayAttendance,
    setTodayAttendance,
  } = useAttendanceStore();

  async function loadTodayAttendance(employeeId: string) {
    setLoading(true);

    try {
      const attendance =
        await getTodayAttendance(employeeId);

      setTodayAttendance(attendance);
    } finally {
      setLoading(false);
    }
  }

  async function requestLocation() {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    return location;
  }

  async function saveAttendance(
    payload: MarkAttendancePayload
  ) {
    setLoading(true);

    try {
      const attendance =
        await markAttendance(payload);

      setTodayAttendance(attendance);

      return attendance;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    todayAttendance,
    loadTodayAttendance,
    requestLocation,
    saveAttendance,
  };
}