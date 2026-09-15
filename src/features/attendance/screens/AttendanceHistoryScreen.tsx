import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import dayjs from "dayjs";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppCard from "../../../components/ui/AppCard";
import Colors from "../../../theme/color";
import { useAuthStore } from "../../auth/store/auth.store";
import { getCurrentMonthAttendance } from "../services/attendance.service";
import { Attendance } from "../types/attendance.types";

type HistoryItem = {
  date: string;
  day: string;
  status: "PRESENT" | "HALF_DAY" | "LEAVE" | "ABSENT" | "NOT_MARKED";
  label: string;
  color: string;
};

function statusMeta(status: string) {
  switch (status) {
    case "PRESENT":
      return { label: "Present", color: "#16A34A" };
    case "HALF_DAY":
      return { label: "Half Day", color: "#EAB308" };
    case "LEAVE":
    case "ABSENT":
      return { label: "Leave", color: "#DC2626" };
    default:
      return { label: "Not Marked", color: "#94A3B8" };
  }
}

export default function AttendanceHistoryScreen() {
  const employee = useAuthStore((state) => state.employee);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!employee) return;

    setError(null);
    try {
      const data = await getCurrentMonthAttendance(employee.id);
      setRecords(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance history."
      );
    }
  }, [employee]);

  useEffect(() => {
    setLoading(true);
    void loadHistory().finally(() => setLoading(false));
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadHistory();
    } finally {
      setRefreshing(false);
    }
  }, [loadHistory]);

  const recordMap = useMemo(
    () =>
      new Map(
        records.map((record) => [record.attendance_date, record])
      ),
    [records]
  );

  const days = useMemo<HistoryItem[]>(() => {
    const today = dayjs();
    const start = today.startOf("month");
    const end = today.endOf("month");
    const items: HistoryItem[] = [];

    for (
      let cursor = start;
      cursor.isBefore(end) || cursor.isSame(end, "day");
      cursor = cursor.add(1, "day")
    ) {
      const date = cursor.format("YYYY-MM-DD");
      const record = recordMap.get(date);
      const status = record?.status ?? "NOT_MARKED";
      const meta = statusMeta(status);

      items.push({
        date,
        day: cursor.format("ddd"),
        status: status as HistoryItem["status"],
        label: meta.label,
        color: meta.color,
      });
    }

    return items.reverse();
  }, [recordMap]);

  const counts = useMemo(() => {
    return records.reduce(
      (result, record) => {
        if (record.status === "PRESENT") result.present += 1;
        else if (record.status === "HALF_DAY") result.halfDay += 1;
        else if (record.status === "LEAVE" || record.status === "ABSENT") result.leave += 1;
        return result;
      },
      { present: 0, halfDay: 0, leave: 0 }
    );
  }, [records]);

  if (!employee) return null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        title="Attendance History"
        subtitle={dayjs().format("MMMM YYYY")}
      />

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: "#16A34A" }]} />
          <Text style={styles.summaryValue}>{counts.present}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: "#EAB308" }]} />
          <Text style={styles.summaryValue}>{counts.halfDay}</Text>
          <Text style={styles.summaryLabel}>Half Day</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: "#DC2626" }]} />
          <Text style={styles.summaryValue}>{counts.leave}</Text>
          <Text style={styles.summaryLabel}>Leave</Text>
        </View>
      </View>

      <AppCard>
        <View style={styles.titleRow}>
          <View style={styles.accentBar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Current Month</Text>
            <Text style={styles.subtitle}>
              Attendance record for {dayjs().format("MMMM YYYY")}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.list}>
            {days.map((item) => {
              const isFuture = dayjs(item.date).isAfter(dayjs(), "day");

              return (
                <View style={styles.historyRow} key={item.date}>
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateNumber}>
                      {dayjs(item.date).format("DD")}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {dayjs(item.date).format("MMM")}
                    </Text>
                  </View>

                  <View style={styles.dayBlock}>
                    <Text style={styles.dayText}>{item.day}</Text>
                    <Text style={styles.fullDate}>
                      {dayjs(item.date).format("DD MMM YYYY")}
                    </Text>
                  </View>

                  <View style={styles.statusBlock}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: isFuture ? "#CBD5E1" : item.color,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: isFuture ? "#94A3B8" : item.color },
                      ]}
                    >
                      {isFuture ? "Upcoming" : item.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  container: {
    padding: 18,
    paddingBottom: 40,
    gap: 16,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },

  summaryCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E6EEF6",
    justifyContent: "center",
    shadowColor: "#0E2E4C",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  summaryDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginBottom: 7,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#16324F",
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    color: "#8697A8",
    textTransform: "uppercase",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  accentBar: {
    width: 4,
    height: 30,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  title: {
    fontSize: 17,
    fontWeight: "900",
    color: "#16324F",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#8697A8",
    fontWeight: "600",
  },

  loader: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    marginTop: 14,
  },

  historyRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
  },

  dateBlock: {
    width: 48,
    alignItems: "center",
  },

  dateNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#16324F",
  },

  dateMonth: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
  },

  dayBlock: {
    flex: 1,
    marginLeft: 10,
  },

  dayText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },

  fullDate: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },

  statusBlock: {
    minWidth: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 7,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  errorText: {
    marginTop: 16,
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 13,
  },
});
