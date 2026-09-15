import * as Location from "expo-location";
import * as Network from "expo-network";

import { supabase } from "../supabase/supabase";

const LIVE_LOCATIONS_TABLE = "employee_live_locations";
const TRACKING_INTERVAL_MS = 10 * 60 * 1000;

let trackingTimer: ReturnType<typeof setInterval> | null = null;
let activeEmployeeId: string | null = null;

interface LocationSnapshot {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  batteryLevel?: number | null;
}

function buildPayload(employeeId: string, snapshot: LocationSnapshot, isWorking: boolean) {
  const now = new Date().toISOString();

  return {
    employee_id: employeeId,
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    accuracy: snapshot.accuracy ?? null,
    speed: snapshot.speed ?? null,
    heading: snapshot.heading ?? null,
    battery_level: snapshot.batteryLevel ?? null,
    is_working: isWorking,
    updated_at: now,
    created_at: now,
  };
}

export const locationTrackingService = {
  async requestPermissions(): Promise<boolean> {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    return granted;
  },

  async getCurrentLocation(): Promise<LocationSnapshot> {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      batteryLevel: null,
    };
  },

  async isOnline(): Promise<boolean> {
    try {
      const state = await Network.getNetworkStateAsync();
      return state.isConnected ?? false;
    } catch {
      return true;
    }
  },

  async syncLiveLocation(employeeId: string, snapshot?: LocationSnapshot, isWorking = true): Promise<boolean> {
    const online = await this.isOnline();
    if (!online) {
      return false;
    }

    const currentSnapshot = snapshot ?? (await this.getCurrentLocation());
    const payload = buildPayload(employeeId, currentSnapshot, isWorking);

    const { error } = await supabase
      .from(LIVE_LOCATIONS_TABLE)
      .upsert(payload, { onConflict: "employee_id" });

    if (error) {
      throw error;
    }

    return true;
  },

  async startTracking(employeeId: string, snapshot: LocationSnapshot): Promise<void> {
    await this.syncLiveLocation(employeeId, snapshot, true);

    if (trackingTimer) {
      clearInterval(trackingTimer);
    }

    activeEmployeeId = employeeId;
    trackingTimer = setInterval(() => {
      if (!activeEmployeeId) {
        return;
      }

      void this.syncLiveLocation(activeEmployeeId, undefined, true);
    }, TRACKING_INTERVAL_MS);
  },

  async stopTracking(employeeId: string, snapshot: LocationSnapshot): Promise<boolean> {
    if (trackingTimer) {
      clearInterval(trackingTimer);
      trackingTimer = null;
    }

    activeEmployeeId = null;
    return this.syncLiveLocation(employeeId, snapshot, false);
  },
};
