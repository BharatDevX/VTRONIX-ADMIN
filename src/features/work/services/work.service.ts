import { supabase } from "../../../services/supabase";
import { locationTrackingService } from "../../../services/location/LocationTrackingService";
import { WorkSession, StartWorkForm, EndWorkForm } from "../types/work.types";

const TABLE = "work_sessions";

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistance(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number
) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(endLatitude - startLatitude);
  const dLon = toRadians(endLongitude - startLongitude);

  const lat1 = toRadians(startLatitude);
  const lat2 = toRadians(endLatitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("duplicate") || message.includes("already exists") || message.includes("unique")) {
    return new Error("Duplicate work session.");
  }

  if (message.includes("permission") || message.includes("denied")) {
    return new Error("Location permission denied.");
  }

  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return new Error("Network issue.");
  }

  if (message.includes("today's work already completed") || message.includes("already completed")) {
    return new Error("Today's work already completed.");
  }

  if (message.includes("today's work already started") || message.includes("already started")) {
    return new Error("Today's work already started.");
  }

  if (message.includes("today's work session") || message.includes("work session")) {
    return new Error("Unable to find today's work session.");
  }

  return new Error("Unable to save the work session right now.");
}

function getPreferredSession(sessions: WorkSession[]) {
  if (sessions.length === 0) {
    return null;
  }

  return [...sessions].sort((left, right) => {
    const leftStarted = left.status === "started" ? 1 : 0;
    const rightStarted = right.status === "started" ? 1 : 0;

    if (leftStarted !== rightStarted) {
      return rightStarted - leftStarted;
    }

    const leftTime = Date.parse(left.start_time ?? left.end_time ?? left.work_date) || 0;
    const rightTime = Date.parse(right.start_time ?? right.end_time ?? right.work_date) || 0;

    return rightTime - leftTime;
  })[0];
}

export const workService = {
  async getTodaySessions(employeeId: string): Promise<WorkSession[]> {
    const today = getTodayDate();

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("employee_id", employeeId)
      .eq("work_date", today);

    if (error) throw toFriendlyError(error);

    return (data ?? []) as WorkSession[];
  },

  async getTodaySession(employeeId: string): Promise<WorkSession | null> {
    const sessions = await this.getTodaySessions(employeeId);
    return getPreferredSession(sessions);
  },

  async startWork(employeeId: string, form: StartWorkForm): Promise<WorkSession> {
    const today = getTodayDate();
    const sessions = await this.getTodaySessions(employeeId);
    const existing = getPreferredSession(sessions);

    if (existing) {
      if (existing.status === "started") {
        return existing;
      }

      throw new Error("Today's work already completed.");
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        employee_id: employeeId,
        work_date: today,
        start_time: new Date().toISOString(),
        start_meter: null,
        start_latitude: form.latitude,
        start_longitude: form.longitude,
        end_time: null,
        end_meter: null,
        end_latitude: null,
        end_longitude: null,
        total_km: 0,
        status: "started",
      })
      .select()
      .single();

    if (error) throw toFriendlyError(error);

    await locationTrackingService.startTracking(employeeId, {
      latitude: form.latitude,
      longitude: form.longitude,
    });

    return data as WorkSession;
  },

  async endWork(employeeId: string, form: EndWorkForm): Promise<WorkSession> {
    const sessions = await this.getTodaySessions(employeeId);
    const activeSession = sessions.find((session) => session.status === "started") ?? null;

    if (!activeSession) {
      const latest = getPreferredSession(sessions);

      if (latest?.status === "completed") {
        throw new Error("Today's work already completed.");
      }

      throw new Error("Unable to find today's work session.");
    }

    if (activeSession.start_latitude == null || activeSession.start_longitude == null) {
      throw new Error("Unable to calculate distance without start location.");
    }

    const totalKm = parseFloat(
      calculateDistance(
        activeSession.start_latitude,
        activeSession.start_longitude,
        form.latitude,
        form.longitude
      ).toFixed(2)
    );

    const { data, error: updateError } = await supabase
      .from(TABLE)
      .update({
        end_time: new Date().toISOString(),
        end_meter: null,
        end_latitude: form.latitude,
        end_longitude: form.longitude,
        total_km: totalKm,
        status: "completed",
      })
      .eq("id", activeSession.id)
      .select()
      .single();

    if (updateError) throw toFriendlyError(updateError);

    await locationTrackingService.stopTracking(employeeId, {
      latitude: form.latitude,
      longitude: form.longitude,
    });

    return data as WorkSession;
  },
};