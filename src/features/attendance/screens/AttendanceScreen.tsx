import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";

import dayjs from "dayjs";

import AppCard from "../../../components/ui/AppCard";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import ScreenHeader from "../../../components/ui/ScreenHeader";

import { useAttendance } from "../hooks/useAttendance";
import { useAuthStore } from "../../auth/store/auth.store";
import { useWork } from "../../work/hooks/useWork";

export default function AttendanceScreen() {
  const { employee } = useAuthStore();

  const {
    loading,
    todayAttendance,
    loadTodayAttendance,
    requestLocation,
    saveAttendance,
  } = useAttendance();

  // Reuses the exact same startWork() used by StartWorkScreen — same service
  // call, same duplicate-session guard, same background-tracking kickoff.
  const { startWork } = useWork(employee?.id ?? "");

  const [locationText, setLocationText] =
    useState("Detecting location...");

  // --- animation values (visual only, no logic impact) ---
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (employee) {
      loadTodayAttendance(employee.id);
    }

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function handleAttendance() {
    try {
      if (!employee) return;

      if (todayAttendance) {
        Alert.alert(
          "Attendance",
          "Attendance already marked."
        );
        return;
      }

      const location = await requestLocation();

      const latitude =
        location.coords.latitude;

      const longitude =
        location.coords.longitude;

      setLocationText(
        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      );

      const savedAttendance = await saveAttendance({
        employee_id: employee.id,
        latitude,
        longitude,
      });

      // Attendance succeeded — automatically start today's work session using
      // the SAME coordinates already captured above (no second GPS request,
      // no second permission prompt). This calls the existing startWork(),
      // which already creates the work_sessions row, guards against a
      // duplicate session for today, and starts background tracking.
      let workStarted = false;

      // Leave should not start a work session. Present and Half Day continue
      // using the existing work-session/background-location functionality.
      if (
        savedAttendance.status === "PRESENT" ||
        savedAttendance.status === "HALF_DAY"
      ) {
        try {
          const session = await startWork({ latitude, longitude });
          workStarted = !!session;
        } catch (workError) {
          // Attendance itself already succeeded; do not treat a work-session
          // edge case as an attendance failure.
        }
      }

      Alert.alert(
        "Success",
        workStarted
          ? "Attendance marked successfully.\nWork session started successfully."
          : "Attendance marked successfully."
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message ?? "Something went wrong."
      );
    }
  }

  const activeStatus = todayAttendance
    ? todayAttendance.status === "PRESENT"
      ? { label: "Present", color: "#1D9C6E" }
      : todayAttendance.status === "HALF_DAY"
        ? { label: "Half Day", color: "#C79A1E" }
        : { label: "Leave", color: "#E0562B" }
    : { label: "Not Marked", color: "#94A3B8" };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Attendance"
        subtitle="Mark your attendance for today"
      />

      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
          gap: 18,
        }}
      >
        {/* ---------- HERO / TODAY OVERVIEW ---------- */}
        <View style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>TODAY'S OVERVIEW</Text>
            </View>

            <View
              style={[
                styles.statusPill,
                { backgroundColor: "rgba(255,255,255,0.16)" },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: activeStatus.color },
                ]}
              />
              <Text style={styles.statusPillText}>{activeStatus.label}</Text>
            </View>
          </View>

          <Text style={styles.heroTime}>{dayjs().format("hh:mm A")}</Text>
          <Text style={styles.heroDate}>{dayjs().format("dddd, DD MMM YYYY")}</Text>

          <View style={styles.heroLocationCard}>
            <Text style={styles.heroLocationLabel}>Current Location</Text>
            <Text style={styles.heroLocationValue} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>

        {/* ---------- AUTOMATIC ATTENDANCE ---------- */}
        <AppCard>
          <View style={styles.sectionHeadRow}>
            <View style={styles.accentBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Automatic Attendance</Text>
              <Text style={styles.cardSubtitle}>
                Your status is determined from the time you mark attendance.
              </Text>
            </View>
          </View>

          <View style={styles.timeRuleCard}>
            <View style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: "#16A34A" }]} />
              <Text style={styles.ruleText}>Before 10:00 AM</Text>
              <Text style={styles.ruleValue}>Present</Text>
            </View>

            <View style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: "#EAB308" }]} />
              <Text style={styles.ruleText}>10:00 AM – 1:59 PM</Text>
              <Text style={styles.ruleValue}>Half Day</Text>
            </View>

            <View style={[styles.ruleRow, styles.ruleRowLast]}>
              <View style={[styles.ruleDot, { backgroundColor: "#DC2626" }]} />
              <Text style={styles.ruleText}>2:00 PM onward</Text>
              <Text style={styles.ruleValue}>Leave</Text>
            </View>
          </View>
        </AppCard>

        <View style={styles.submitWrap}>
          <PrimaryButton
            title={todayAttendance ? "Attendance Already Marked" : "Mark Attendance"}
            loading={loading}
            onPress={handleAttendance}
            disabled={!!todayAttendance}
          />
          <Text style={styles.helperNote}>
            Location is captured automatically. No manual status selection is required.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F8FC" },

  container: {
    padding: 20,
    paddingBottom: 44,
    gap: 18,
  },

  /* ---------- HERO ---------- */
  hero: {
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    backgroundColor: "#0F76AE",
    overflow: "hidden",
    shadowColor: "#00416E",
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 8,
  },

  heroGlowOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -90,
    right: -60,
    backgroundColor: "rgba(255,255,255,0.13)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    bottom: -110,
    left: -70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  heroBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FFFFFF",
  },

  heroTime: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },

  heroDate: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#CFE8FF",
  },

  heroLocationCard: {
    marginTop: 18,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  heroLocationLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "#BFDFFA",
  },

  heroLocationValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* ---------- SECTIONS ---------- */
  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  accentBar: {
    width: 4,
    height: 30,
    borderRadius: 3,
    backgroundColor: "#1597D4",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16324F",
  },

  cardSubtitle: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#8697A8",
    marginTop: 3,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  timeRuleCard: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  ruleRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  ruleRowLast: {
    borderBottomWidth: 0,
  },

  ruleDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
  },

  ruleText: {
    flex: 1,
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
  },

  ruleValue: {
    fontSize: 12.5,
    color: "#16324F",
    fontWeight: "800",
  },

  submitWrap: {
    marginTop: 2,
    gap: 10,
  },

  helperNote: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B2",
  },
});
