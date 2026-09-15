import React, { useRef, useState } from "react";
import { Alert, Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppInput from "../../../components/ui/AppInput";
import AppDatePicker from "../../../components/ui/AppDatePicker";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import AppCard from "../../../components/ui/AppCard";
import { useAuthStore } from "../../auth/store/auth.store";
import { createFarmerPlan } from "../services/farmerPlan.service";
import type { FarmerMeetingPlanForm } from "../types/farmerPlan.types";

const createEmptyForm = (): FarmerMeetingPlanForm => ({
  farmer_name: "",
  location: "",
  planned_date: dayjs().format("YYYY-MM-DD"),
  note: "",
});

export default function FarmerMeetingPlanScreen() {
  const { employee } = useAuthStore();
  const [form, setForm] = useState(createEmptyForm);
  const [saving, setSaving] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const update = (patch: Partial<FarmerMeetingPlanForm>) => setForm((current) => ({ ...current, ...patch }));

  async function save() {
    if (!employee?.id) return;
    if (!form.farmer_name.trim()) {
      Alert.alert("Farmer required", "Please enter the farmer name.");
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      await createFarmerPlan(employee.id, form);
      Alert.alert("Success", "Farmer Meeting Plan Saved");
      setForm(createEmptyForm());
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save farmer meeting plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Monthly Meeting Plan" subtitle="Plan upcoming farmer meetings for this month" />
      <Animated.View style={{ opacity, transform: [{ translateY }], gap: 16 }}>
        <AppCard>
          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>FARMER MEETING DETAILS</Text></View>
          <View style={styles.fields}>
            <AppInput label="Farmer Name" value={form.farmer_name} onChangeText={(text) => update({ farmer_name: text })} placeholder="Enter farmer name" />
            <AppInput label="Location" value={form.location} onChangeText={(text) => update({ location: text })} placeholder="Enter meeting location" />
            <AppDatePicker label="Planned Date" value={form.planned_date} onChange={(date) => update({ planned_date: date })} />
            <AppInput label="Note" value={form.note} onChangeText={(text) => update({ note: text.slice(0, 1000) })} placeholder="Optional note" multiline numberOfLines={4} />
          </View>
        </AppCard>
        <PrimaryButton title="Save Meeting Plan" onPress={save} loading={saving} disabled={saving} />
        <Text style={styles.hint}>After saving, the form automatically clears for the next meeting.</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { padding: 20, paddingBottom: 44, gap: 16 },
  sectionHead: { marginBottom: 4, paddingHorizontal: 2 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6B7280", letterSpacing: 0.6 },
  fields: { gap: 12, marginTop: 10 },
  hint: { textAlign: "center", fontSize: 11.5, color: "#8A8F98", fontWeight: "500" },
});
