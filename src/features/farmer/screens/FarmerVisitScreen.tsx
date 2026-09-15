import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppInput from "../../../components/ui/AppInput";
import AppSearchDropdown from "../../../components/ui/AppSearchDropdown";
import AppDatePicker from "../../../components/ui/AppDatePicker";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import AppCard from "../../../components/ui/AppCard";
import { useAuthStore } from "../../auth/store/auth.store";
import { saveFarmerVisit } from "../services/farmerVisit.service";
import { FarmerVisitForm } from "../types/farmerVisit.types";
import { getDealers } from "../../master/services/master.service";

const createEmptyForm = (): FarmerVisitForm => ({
  farmer_name: "",
  visit_date: dayjs().format("YYYY-MM-DD"),
  visit_time: dayjs().format("HH:mm"),
  location: "",
  discussion: "",
  outcome: "",
  next_followup_date: dayjs().format("YYYY-MM-DD"),
});

export default function FarmerVisitScreen() {
  const { employee } = useAuthStore();
  const [form, setForm] = useState(createEmptyForm);
  const [saving, setSaving] = useState(false);
  const [dealers, setDealers] = useState<any[]>([]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    let mounted = true;

    async function loadDealers() {
      try {
        const dealerList = await getDealers();
        if (mounted) {
          setDealers(dealerList ?? []);
        }
      } catch (error) {
        if (mounted) {
          Alert.alert("Error", "Unable to load farmer names right now.");
        }
      }
    }

    void loadDealers();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const update = (patch: Partial<FarmerVisitForm>) => setForm((current) => ({ ...current, ...patch }));

  async function save() {
    if (!employee?.id || saving) return;
    if (!form.farmer_name.trim()) return Alert.alert("Validation", "Please select the farmer name.");
    if (!form.location.trim()) return Alert.alert("Validation", "Please enter the visit location.");
    if (!form.discussion.trim()) return Alert.alert("Validation", "Please enter the discussion.");
    if (!form.outcome.trim()) return Alert.alert("Validation", "Please enter the outcome.");

    setSaving(true);
    try {
      const result = await saveFarmerVisit(employee.id, form);
      Alert.alert("Success", result.isUpdate ? "Farmer Visit Updated Successfully" : "Farmer Visit Saved Successfully");
      setForm(createEmptyForm());
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save farmer visit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Farmer Visit" subtitle="Log a field visit with a farmer" />
      <Animated.View style={{ opacity, transform: [{ translateY }], gap: 16 }}>
        <AppCard>
          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>VISIT DETAILS</Text></View>
          <View style={styles.fields}>
            <AppSearchDropdown
              label="Farmer Name"
              data={dealers}
              labelField="dealer_name"
              valueField="dealer_name"
              value={form.farmer_name}
              placeholder="Select farmer name"
              onChange={(item) => update({ farmer_name: item.dealer_name ?? "" })}
            />
            <AppDatePicker label="Visit Date" value={form.visit_date} onChange={(date) => update({ visit_date: date })} />
            <AppInput label="Visit Time" value={form.visit_time} onChangeText={(text) => update({ visit_time: text })} placeholder="HH:mm" />
            <AppInput label="Location" value={form.location} onChangeText={(text) => update({ location: text })} placeholder="Enter location" />
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>DISCUSSION & OUTCOME</Text></View>
          <View style={styles.fields}>
            <AppInput label="Discussion" value={form.discussion} onChangeText={(text) => update({ discussion: text })} placeholder="Enter discussion" multiline numberOfLines={4} />
            <AppInput label="Outcome" value={form.outcome} onChangeText={(text) => update({ outcome: text })} placeholder="Enter outcome" multiline numberOfLines={4} />
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>FOLLOW-UP</Text></View>
          <View style={styles.fields}>
            <AppDatePicker label="Next Follow-up" value={form.next_followup_date} onChange={(date) => update({ next_followup_date: date })} />
          </View>
        </AppCard>

        <PrimaryButton title="Save Visit" onPress={save} loading={saving} disabled={saving} />
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
});
