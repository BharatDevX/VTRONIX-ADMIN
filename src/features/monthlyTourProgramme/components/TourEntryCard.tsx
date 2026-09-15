import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { MonthlyTourEntry } from "../types/monthlyTourProgramme.types";

interface Props {
  entry: MonthlyTourEntry;
  editable?: boolean;
  onEdit: (entry: MonthlyTourEntry) => void;
  onDelete: (id: string) => void;
}

const typeTheme = (type: MonthlyTourEntry["hq_ex_tour"]) => {
  switch (type) {
    case "HQ":
      return { bg: "#EEF2FF", fg: "#4F6BED" };

    case "EX":
      return { bg: "#FFF3E6", fg: "#E08A2B" };

    default:
      return { bg: "#E7F7F0", fg: "#1D9C6E" };
  }
};

export default function TourEntryCard({
  entry,
  editable = true,
  onEdit,
  onDelete,
}: Props) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Tour",
      "Are you sure you want to delete this tour?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(entry.id),
        },
      ]
    );
  };

  const theme = typeTheme(entry.hq_ex_tour);
  const date = new Date(entry.tour_date);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: theme.fg }]} />

      <View style={styles.head}>
        <View style={[styles.dateBox, { backgroundColor: theme.bg }]}>
          <Text style={[styles.dateDay, { color: theme.fg }]}>
            {date.getDate()}
          </Text>

          <Text style={[styles.dateMonth, { color: theme.fg }]}>
            {date.toLocaleString("default", { month: "short" }).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {date.toDateString()}
          </Text>

          <Text style={styles.subtitle} numberOfLines={1}>
            {entry.route_plan_details}
          </Text>
        </View>

        <View style={[styles.typePill, { backgroundColor: theme.bg }]}>
          <Text style={[styles.typePillText, { color: theme.fg }]}>
            {entry.hq_ex_tour}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Route</Text>
        <Text style={styles.value} numberOfLines={2}>
          {entry.route_plan_details}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Travel</Text>
        <Text style={styles.value}>{entry.travel_mode || "-"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>KM</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{entry.total_km}</Text>
        </View>
      </View>

      <View style={styles.rowLast}>
        <Text style={styles.label}>Route No.</Text>
        <Text style={styles.value}>{entry.route_no || "-"}</Text>
      </View>

      {entry.note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>NOTE / REMARK</Text>
          <Text style={styles.noteText}>{entry.note}</Text>
        </View>
      ) : null}

      {editable && (
        <>
          <View style={styles.divider} />

          <View style={styles.buttonRow}>
            <Button
              mode="contained-tonal"
              icon="pencil"
              onPress={() => onEdit(entry)}
              style={styles.actionButton}
              contentStyle={styles.actionContent}
              labelStyle={styles.actionLabel}
            >
              Edit
            </Button>

            <Button
              mode="contained"
              icon="delete"
              buttonColor="#D32F2F"
              onPress={handleDelete}
              style={styles.actionButton}
              contentStyle={styles.actionContent}
              labelStyle={styles.actionLabel}
            >
              Delete
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF1F6",
    overflow: "hidden",
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  accent: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    opacity: 0.9,
  },

  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  dateBox: {
    width: 46,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  dateDay: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 20,
  },

  dateMonth: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#101418",
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: "#8A8F98",
  },

  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  typePillText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F6",
    marginVertical: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F6FA",
    gap: 12,
  },

  rowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8A8F98",
    flex: 1,
  },

  value: {
    flex: 2,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#101418",
  },

  chip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#F1F4F9",
  },

  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3C4350",
  },

  noteBox: { marginTop: 12, padding: 11, borderRadius: 12, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E7EDF3" },
  noteLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6, color: "#1D9C6E", marginBottom: 4 },
  noteText: { fontSize: 12.5, lineHeight: 18, color: "#4B5563" },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },

  actionButton: {
    flex: 1,
    borderRadius: 999,
  },

  actionContent: {
    paddingVertical: 2,
  },

  actionLabel: {
    fontWeight: "700",
  },
});
