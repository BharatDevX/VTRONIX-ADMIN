import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { MonthlyTourProgramme } from "../types/monthlyTourProgramme.types";

interface Props {
  programme: MonthlyTourProgramme | null;
  employeeName: string;
}

const statusColor = (
  status?: MonthlyTourProgramme["status"]
): "primary" | "secondary" | "error" | "tertiary" => {
  switch (status) {
    case "approved":
      return "primary";

    case "submitted":
      return "secondary";

    case "rejected":
      return "error";

    default:
      return "tertiary";
  }
};

const statusTheme = (
  status?: MonthlyTourProgramme["status"]
) => {
  switch (status) {
    case "approved":
      return { bg: "rgba(29,156,110,0.18)", fg: "#8FD9BE", dot: "#1D9C6E" };

    case "submitted":
      return { bg: "rgba(79,107,237,0.20)", fg: "#B9C4FF", dot: "#4F6BED" };

    case "rejected":
      return { bg: "rgba(220,38,38,0.20)", fg: "#FFB4B4", dot: "#DC2626" };

    default:
      return { bg: "rgba(255,255,255,0.12)", fg: "#D8DEE6", dot: "#A6ADB8" };
  }
};

const monthName = (month?: number) => {
  if (!month) return "";

  return new Date(2025, month - 1).toLocaleString("default", {
    month: "long",
  });
};

export default function TourHeader({
  programme,
  employeeName,
}: Props) {
  const theme = statusTheme(programme?.status);

  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>
            Monthly Tour Programme
          </Text>

          <Text style={styles.month}>
            {monthName(programme?.month)} {programme?.year}
          </Text>
        </View>

        <View
          style={[styles.statusChip, { backgroundColor: theme.bg }]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: theme.dot }]}
          />

          <Text style={[styles.statusText, { color: theme.fg }]}>
            {programme?.status?.toUpperCase() ?? "DRAFT"}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(employeeName || "?").trim().charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {employeeName || "-"}
            </Text>

            <Text style={styles.designation} numberOfLines={1}>
              {programme?.designation || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>
              📍 {programme?.hq || "-"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 22,
    padding: 20,
    backgroundColor: "#101A16",
    overflow: "hidden",
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },

  glow: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#1D9C6E",
    opacity: 0.26,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#8FD9BE",
  },

  month: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },

  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  info: {
    marginTop: 20,
    gap: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#E8FFF5",
  },

  name: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  designation: {
    marginTop: 2,
    fontSize: 12.5,
    color: "#9FB0A8",
  },

  metaRow: {
    flexDirection: "row",
    gap: 8,
  },

  metaPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  metaPillText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#DCE7E1",
  },
});
