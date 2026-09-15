import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Alert, StyleSheet, View, Text, Animated, Easing } from "react-native";

import dayjs from "dayjs";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppSearchDropdown from "../../../components/ui/AppSearchDropdown";
import AppDatePicker from "../../../components/ui/AppDatePicker";
import AppInput from "../../../components/ui/AppInput";
import PrimaryButton from "../../../components/ui/PrimaryButton";

import { useMasters } from "../../master/hooks/useMasters";
import { useDealerVisit } from "../hooks/useDealerVisit";
import { useAuthStore } from "../../auth/store/auth.store";

type DealerVisitForm = {
  dealer_id: string;
  visit_date: string;
  visit_time: string;
  location: string;
  discussion: string;
  outcome: string;
  next_followup_date: string;
};

const initialForm = (): DealerVisitForm => ({
  dealer_id: "",
  visit_date: dayjs().format("YYYY-MM-DD"),
  visit_time: dayjs().format("HH:mm"),
  location: "",
  discussion: "",
  outcome: "",
  next_followup_date: dayjs().format("YYYY-MM-DD"),
});

export default function DealerVisitScreen() {
  const { employee } = useAuthStore();
  const { dealers } = useMasters();
  const { save, saving } = useDealerVisit(employee?.id ?? "");

  const [form, setForm] = useState<DealerVisitForm>(initialForm);

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  async function saveVisit() {
    if (!form.dealer_id) {
      Alert.alert("Validation", "Please select a dealer before saving.");
      return;
    }

    try {
      const result = await save(form);
      Alert.alert("Success", result?.isUpdate ? "Existing record updated successfully." : "Saved successfully.");
      setForm(initialForm());
    } catch {
      Alert.alert("Error", "Unable to save the dealer visit right now.");
    }
  }

  const locationReady = Boolean(form.location.trim());

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Dealer Visit"
        subtitle="Log a field visit with a dealer"
      />

      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
          gap: 16,
        }}
      >
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, locationReady ? styles.dotOn : styles.dotOff]} />

          <Text style={styles.statusText}>
            {locationReady ? "GPS location captured" : "Fetching your location…"}
          </Text>

          <View style={styles.datePill}>
            <Text style={styles.datePillText}>{dayjs(form.visit_date).format("DD MMM")}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.stepBadge, { backgroundColor: "#E7F7F0" }]}>
              <Text style={[styles.stepBadgeText, { color: "#1D9C6E" }]}>1</Text>
            </View>

            <View style={styles.headText}>
              <Text style={styles.cardTitle}>Visit Details</Text>
              <Text style={styles.cardSub}>Dealer, schedule and location</Text>
            </View>
          </View>

          <View style={[styles.accent, { backgroundColor: "#1D9C6E" }]} />

          <View style={styles.fieldGroup}>
            <AppSearchDropdown
              label="Dealer"
              data={dealers}
              labelField="dealer_name"
              valueField="id"
              value={form.dealer_id}
              onChange={(item) => setForm({ ...form, dealer_id: item.id })}
            />

            <AppDatePicker
              label="Visit Date"
              value={form.visit_date}
              onChange={(date) => setForm({ ...form, visit_date: date })}
            />

            <AppInput
              label="Visit Time"
              placeholder="HH:mm"
              value={form.visit_time}
              onChangeText={(text) => setForm({ ...form, visit_time: text })}
            />

            <AppInput
              label="Location"
              placeholder="Enter location"
              value={form.location}
              editable={true}
              onChangeText={(text) => setForm({ ...form, location: text })}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.stepBadge, { backgroundColor: "#E8F0FE" }]}>
              <Text style={[styles.stepBadgeText, { color: "#2563EB" }]}>2</Text>
            </View>

            <View style={styles.headText}>
              <Text style={styles.cardTitle}>Discussion & Outcome</Text>
              <Text style={styles.cardSub}>What was covered and agreed</Text>
            </View>
          </View>

          <View style={[styles.accent, { backgroundColor: "#2563EB" }]} />

          <View style={styles.fieldGroup}>
            <AppInput
              label="Discussion"
              placeholder="Enter discussion"
              multiline
              value={form.discussion}
              onChangeText={(text) => setForm({ ...form, discussion: text })}
            />

            <AppInput
              label="Outcome"
              placeholder="Enter outcome"
              multiline
              value={form.outcome}
              onChangeText={(text) => setForm({ ...form, outcome: text })}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.stepBadge, { backgroundColor: "#FDF0E4" }]}>
              <Text style={[styles.stepBadgeText, { color: "#D97706" }]}>3</Text>
            </View>

            <View style={styles.headText}>
              <Text style={styles.cardTitle}>Follow-up</Text>
              <Text style={styles.cardSub}>Plan the next dealer touchpoint</Text>
            </View>
          </View>

          <View style={[styles.accent, { backgroundColor: "#D97706" }]} />

          <View style={styles.fieldGroup}>
            <AppDatePicker
              label="Next Follow-up"
              value={form.next_followup_date}
              onChange={(date) => setForm({ ...form, next_followup_date: date })}
            />
          </View>
        </View>

        <PrimaryButton title="Save Visit" onPress={saveVisit} loading={saving} disabled={saving} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F5F7FA",
  },

  container: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },

  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF1F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dotOn: {
    backgroundColor: "#1D9C6E",
  },

  dotOff: {
    backgroundColor: "#C7CDD6",
  },

  statusText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#6B7280",
  },

  datePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F1F4F9",
  },

  datePillText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#3C4350",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF1F6",
    padding: 16,
    shadowColor: "#0B1220",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headText: {
    flex: 1,
  },

  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  stepBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },

  cardTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#101418",
  },

  cardSub: {
    fontSize: 12,
    color: "#8A8F98",
    marginTop: 2,
    fontWeight: "500",
  },

  accent: {
    height: 3,
    width: 38,
    borderRadius: 999,
    marginTop: 12,
    opacity: 0.9,
  },

  fieldGroup: {
    gap: 12,
    marginTop: 14,
  },
});
