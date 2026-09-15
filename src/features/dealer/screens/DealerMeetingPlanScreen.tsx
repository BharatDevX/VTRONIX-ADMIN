import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Alert, View, Text, Animated, Easing } from "react-native";
import dayjs from "dayjs";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import DealerPlanTable from "../components/DealerPlanTable";
import { useMasters } from "../../master/hooks/useMasters";
import { useDealerPlan } from "../hooks/useDealerPlan";
import { useAuthStore } from "../../auth/store/auth.store";

const createEmptyRow = () => ({
  dealer_id: "",
  location: "",
  planned_date: dayjs().format("YYYY-MM-DD"),
  discussion: "",
});

export default function DealerMeetingPlanScreen() {
  const { employee } = useAuthStore();
  const { dealers } = useMasters();
  const { savePlan, saving } = useDealerPlan(employee?.id ?? "");
  const [row, setRow] = useState(createEmptyRow);
  const [isSaving, setIsSaving] = useState(false);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  function updateRow(_index: number, field: string, value: any) {
    setRow((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (!row.dealer_id || isSaving || saving) {
      if (!row.dealer_id) Alert.alert("Dealer required", "Please select a dealer before saving.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await savePlan(row);
      Alert.alert("Success", result?.isUpdate ? "Existing Dealer Meeting Plan Updated" : "Dealer Meeting Plan Saved");
      setRow(createEmptyRow());
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Unable to save dealer plan.");
    } finally {
      setIsSaving(false);
    }
  }

  const ready = !!row.dealer_id;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Monthly Meeting Plan" subtitle="Plan upcoming dealer meetings for this month" />
      <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }], gap: 16 }}>
        <View style={styles.statRow}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>FORM</Text>
            <Text style={styles.statValue}>1</Text>
            <View style={[styles.statAccent, { backgroundColor: "#2563EB" }]} />
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>READY TO SAVE</Text>
            <Text style={styles.statValue}>{ready ? 1 : 0}</Text>
            <View style={[styles.statAccent, { backgroundColor: "#1D9C6E" }]} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>DEALER MEETING DETAILS</Text>
          </View>
          <DealerPlanTable rows={[row]} dealers={dealers} onChange={updateRow} />
          <Text style={styles.hint}>After saving, this form automatically clears for the next meeting.</Text>
        </View>

        <PrimaryButton title="Save Meeting Plan" onPress={save} loading={isSaving || saving} disabled={isSaving || saving} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F5F7FA" },
  container: { padding: 20, paddingBottom: 44, gap: 16 },
  statRow: { flexDirection: "row", gap: 12 },
  statTile: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EEF1F6", paddingHorizontal: 14, paddingVertical: 14, shadowColor: "#0B1220", shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  statLabel: { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.7, color: "#8A8F98" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#101418", marginTop: 6 },
  statAccent: { height: 3, width: 28, borderRadius: 999, marginTop: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EEF1F6", padding: 14, shadowColor: "#0B1220", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  sectionHead: { marginBottom: 4, paddingHorizontal: 2 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6B7280", letterSpacing: 0.6 },
  hint: { marginTop: 10, fontSize: 11.5, color: "#8A8F98", fontWeight: "500", paddingHorizontal: 2 },
});
