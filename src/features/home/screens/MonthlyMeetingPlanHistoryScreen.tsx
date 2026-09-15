import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppCard from "../../../components/ui/AppCard";
import { useAuthStore } from "../../auth/store/auth.store";
import { getDoctors, getDealers } from "../../master/services/master.service";
import { supabase } from "../../../services/supabase";

type PlanType = "Doctor" | "Dealer" | "Farmer";
interface HistoryPlan {
  id: string;
  type: PlanType;
  party: string;
  location: string;
  planned_date: string;
  note: string | null;
}

async function getMonthlyMeetingPlanHistory(employeeId: string): Promise<HistoryPlan[]> {
  const [{ data: doctorPlans, error: doctorError }, { data: dealerPlans, error: dealerError }, { data: farmerPlans, error: farmerError }] = await Promise.all([
    supabase.from("doctor_meeting_plans").select("id, doctor_id, location, planned_date, reply, created_at").eq("employee_id", employeeId).order("planned_date", { ascending: false }),
    supabase.from("dealer_meeting_plans").select("id, dealer_id, location, planned_date, discussion, created_at").eq("employee_id", employeeId).order("planned_date", { ascending: false }),
    supabase.from("farmer_meeting_plans").select("id, farmer_name, location, planned_date, note, created_at").eq("employee_id", employeeId).order("planned_date", { ascending: false }),
  ]);

  if (doctorError) throw doctorError;
  if (dealerError) throw dealerError;
  if (farmerError) throw farmerError;

  const [doctors, dealers] = await Promise.all([getDoctors(), getDealers()]);
  const doctorMap = new Map((doctors as any[]).map((item) => [item.id, item.doctor_name]));
  const dealerMap = new Map((dealers as any[]).map((item) => [item.id, item.dealer_name]));

  const result: HistoryPlan[] = [
    ...((doctorPlans ?? []) as any[]).map((plan) => ({ id: plan.id, type: "Doctor" as const, party: doctorMap.get(plan.doctor_id) ?? "Unknown doctor", location: plan.location ?? "", planned_date: plan.planned_date, note: plan.reply ?? null })),
    ...((dealerPlans ?? []) as any[]).map((plan) => ({ id: plan.id, type: "Dealer" as const, party: dealerMap.get(plan.dealer_id) ?? "Unknown dealer", location: plan.location ?? "", planned_date: plan.planned_date, note: plan.discussion ?? null })),
    ...((farmerPlans ?? []) as any[]).map((plan) => ({ id: plan.id, type: "Farmer" as const, party: plan.farmer_name, location: plan.location ?? "", planned_date: plan.planned_date, note: plan.note ?? null })),
  ];

  return result.sort((a, b) => dayjs(b.planned_date).valueOf() - dayjs(a.planned_date).valueOf());
}

export default function MonthlyMeetingPlanHistoryScreen() {
  const { employee } = useAuthStore();
  const [plans, setPlans] = useState<HistoryPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!employee?.id) return;
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      setPlans(await getMonthlyMeetingPlanHistory(employee.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load monthly meeting plans.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.screen}>
      <FlatList
        data={plans}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={styles.container}
        ListHeaderComponent={<ScreenHeader title="My Monthly Meeting Plans" subtitle="All monthly meeting plans created by you" />}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" /> : <AppCard><Text style={styles.emptyTitle}>{error ? "Unable to load plans" : "No monthly meeting plans yet"}</Text><Text style={styles.emptyText}>{error ?? "Your saved doctor, dealer and farmer meeting plans will appear here."}</Text></AppCard>}
        renderItem={({ item }) => (
          <AppCard>
            <View style={styles.rowTop}>
              <View style={styles.badge}><Text style={styles.badgeText}>{item.type.toUpperCase()}</Text></View>
              <Text style={styles.date}>{dayjs(item.planned_date).format("DD MMM YYYY")}</Text>
            </View>
            <Text style={styles.party}>{item.party}</Text>
            {!!item.location && <Text style={styles.meta}>Location: {item.location}</Text>}
            {!!item.note && <Text style={styles.note}>Note: {item.note}</Text>}
          </AppCard>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { padding: 20, paddingBottom: 40 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "#E8F3FF" },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#2563EB", letterSpacing: 0.7 },
  date: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  party: { marginTop: 12, fontSize: 17, fontWeight: "800", color: "#101418" },
  meta: { marginTop: 6, fontSize: 13, color: "#657487" },
  note: { marginTop: 8, fontSize: 13, color: "#4B5563", lineHeight: 19 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#101418" },
  emptyText: { marginTop: 6, fontSize: 13, color: "#7B8794", lineHeight: 19 },
});
