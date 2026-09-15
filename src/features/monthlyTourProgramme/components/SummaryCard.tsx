import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { MonthlyTourSummary } from "../types/monthlyTourProgramme.types";

interface Props {
  summary: MonthlyTourSummary;
}

interface StatCardProps {
  title: string;
  value: string | number;
  glyph: string;
  tint: string;
  accent: string;
}

function StatCard({
  title,
  value,
  glyph,
  tint,
  accent,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.topRow}>
        <View style={[styles.glyphBox, { backgroundColor: tint }]}>
          <Text style={[styles.glyph, { color: accent }]}>{glyph}</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <Text style={styles.value}>{value}</Text>

      <View style={[styles.underline, { backgroundColor: accent }]} />
    </View>
  );
}

export default function SummaryCard({
  summary,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard
          title="Planned Days"
          value={summary.plannedDays}
          glyph="📆"
          tint="#EEF2FF"
          accent="#4F6BED"
        />

        <StatCard
          title="Total Tours"
          value={summary.totalTours}
          glyph="🧭"
          tint="#E7F7F0"
          accent="#1D9C6E"
        />
      </View>

      <View style={styles.row}>
        <StatCard
          title="Expected KM"
          value={summary.totalKm}
          glyph="🛣️"
          tint="#FFF3E6"
          accent="#E08A2B"
        />

        <View style={styles.spacerCard} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    gap: 12,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  spacerCard: { flex: 1, backgroundColor: "transparent" },

  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF1F6",
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  glyphBox: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  glyph: {
    fontSize: 13,
  },

  title: {
    flexShrink: 1,
    fontSize: 11.5,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "#8A8F98",
  },

  value: {
    fontSize: 22,
    fontWeight: "800",
    color: "#101418",
    letterSpacing: -0.5,
  },

  underline: {
    height: 3,
    width: 28,
    borderRadius: 3,
    marginTop: 10,
    opacity: 0.85,
  },
});
