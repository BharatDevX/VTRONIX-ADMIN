import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stethoscope, Store, Sprout } from "lucide-react-native";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppRadioGroup from "../../../components/ui/AppRadioGroup";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Visit">;

type VisitType = "doctor" | "dealer" | "farmer";

export default function VisitSelectionScreen({ navigation }: Props) {
  const [visitType, setVisitType] = useState<VisitType>("doctor");

  function continueToVisit() {
    navigation.navigate(visitType === "doctor" ? "DoctorVisit" : visitType === "dealer" ? "DealerVisit" : "FarmerVisit");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Visit" subtitle="Choose the type of visit you want to record" />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Visit Type</Text>
        <Text style={styles.cardSubtitle}>Select one option and continue with the existing visit form.</Text>

        <AppRadioGroup
          options={[
            { label: "Doctor Visit", value: "doctor" },
            { label: "Dealer Visit", value: "dealer" },
            { label: "Farmer Visit", value: "farmer" },
          ]}
          value={visitType}
          onChange={(value) => setVisitType(value as VisitType)}
        />
      </View>

      <View style={styles.previewCard}>
        <View style={styles.iconShell}>
          {visitType === "doctor" ? (
            <Stethoscope size={24} color="#2563EB" strokeWidth={2.2} />
          ) : visitType === "dealer" ? (
            <Store size={24} color="#2563EB" strokeWidth={2.2} />
          ) : (
            <Sprout size={24} color="#2563EB" strokeWidth={2.2} />
          )}
        </View>
        <View style={styles.previewText}>
          <Text style={styles.previewTitle}>
            {visitType === "doctor" ? "Doctor Visit" : visitType === "dealer" ? "Dealer Visit" : "Farmer Visit"}
          </Text>
          <Text style={styles.previewSubtitle}>
            Your existing {visitType === "doctor" ? "doctor" : visitType === "dealer" ? "dealer" : "farmer"} visit form will open next.
          </Text>
        </View>
      </View>

      <PrimaryButton title="Continue" onPress={continueToVisit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { padding: 20, paddingBottom: 44, gap: 16 },
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
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#101418" },
  cardSubtitle: { marginTop: 4, fontSize: 12.5, color: "#8A8F98", lineHeight: 18 },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCEAF8",
    padding: 16,
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F3FF",
  },
  previewText: { flex: 1 },
  previewTitle: { fontSize: 15, fontWeight: "800", color: "#101418" },
  previewSubtitle: { marginTop: 3, fontSize: 12, color: "#8A8F98" },
});
