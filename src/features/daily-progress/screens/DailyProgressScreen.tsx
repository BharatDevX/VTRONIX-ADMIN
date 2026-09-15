import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
  Text,
} from "react-native";

import dayjs from "dayjs";

import Colors from "../../../theme/color";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppInput from "../../../components/ui/AppInput";
import PrimaryButton from "../../../components/ui/PrimaryButton";

import ProgressRow, {
  PartyOption,
  ProgressRowValue,
} from "../components/progressRow";

import { useAuthStore } from "../../auth/store/auth.store";
import { useDailyProgress } from "../hooks/useDailyProgress";
import { DailyProgressEntry } from "../types/dailyProgress.types";

import { getDoctors, getDealers } from "../../master/services/master.service";

export default function DailyProgressScreen() {
  const employee = useAuthStore((state) => state.employee);

  const {
    progress,
    entries,
    loading,
    loadToday,
    createEntry,
  } = useDailyProgress();

  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [formRow, setFormRow] = useState<ProgressRowValue>({
    id: undefined,
    doctor_id: null,
    dealer_id: null,
    party_type: "doctor",
    party_name: "",
    contact_person: "",
    discussion: "",
    reply: "",
    pob_amount: "",
  });

  const isReadOnly = progress?.status === "submitted";

  useEffect(() => {
    if (!employee) {
      return;
    }

    void loadInitial();
  }, [employee?.id]);

  async function loadInitial() {
    if (!employee) {
      return;
    }

    try {
      await loadToday(employee.id);

      const [doctorList, dealerList] = await Promise.all([
        getDoctors(),
        getDealers(),
      ]);

      setDoctors(doctorList);
      setDealers(dealerList);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load daily progress.");
    }
  }

  const partyData = useMemo<PartyOption[]>(() => {
    return [
      ...doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.doctor_name,
        type: "doctor" as const,
        contact: doctor.doctor_name,
      })),
      ...dealers.map((dealer) => ({
        id: dealer.id,
        name: dealer.dealer_name,
        type: "dealer" as const,
        contact: dealer.contact_person,
      })),
    ];
  }, [doctors, dealers]);

  function buildEntryPayload(row: ProgressRowValue) {
    return {
      party_type: row.party_type,
      doctor_id: row.doctor_id,
      dealer_id: row.dealer_id,
      contact_person: row.contact_person,
      discussion: row.discussion,
      reply: row.reply,
      pob_amount: Number(row.pob_amount || 0),
    };
  }

  function resetForm() {
    setFormRow({
      id: undefined,
      doctor_id: null,
      dealer_id: null,
      party_type: "doctor",
      party_name: "",
      contact_person: "",
      discussion: "",
      reply: "",
      pob_amount: "",
    });
  }

  async function handleSubmitVisit() {
    if (isReadOnly || saving) {
      return;
    }

    const hasParty = Boolean(formRow.party_type && (formRow.doctor_id || formRow.dealer_id));
    const hasDiscussion = Boolean(formRow.discussion?.trim());
    const hasReply = Boolean(formRow.reply?.trim());
    if (!hasParty || !hasDiscussion || !hasReply) {
      Alert.alert("Validation Error", "Please complete all visit details before submitting.");
      return;
    }

    setSaving(true);

    try {
      await createEntry(buildEntryPayload(formRow) as DailyProgressEntry);
      // The submitted visit is now safely stored in Supabase.
      // Immediately clear the form so the employee can enter the next visit.
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to submit visit.");
    } finally {
      setSaving(false);
    }
  }

  if (!employee) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Daily Progress" subtitle="Today's visits and POB report" />

      {/* ---------- HERO / DAY SUMMARY ---------- */}
      <View style={styles.hero}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>DAY REPORT</Text>
          </View>

          <View style={styles.heroPill}>
            <View
              style={[
                styles.heroPillDot,
                { backgroundColor: isReadOnly ? "#7FE3B8" : "#FFD37A" },
              ]}
            />
            <Text style={styles.heroPillText}>
              {isReadOnly ? "Submitted" : "Draft"}
            </Text>
          </View>
        </View>

        <Text style={styles.heroDate}>
          {progress ? dayjs(progress.report_date).format("DD MMM YYYY") : dayjs().format("DD MMM YYYY")}
        </Text>
        <Text style={styles.heroDay}>
          {progress ? dayjs(progress.report_date).format("dddd") : dayjs().format("dddd")}
        </Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaTile}>
            <Text style={styles.heroMetaLabel}>VISITS</Text>
            <Text style={styles.heroMetaValue}>{entries.length}</Text>
          </View>

          <View style={styles.heroMetaTile}>
            <Text style={styles.heroMetaLabel}>TOTAL KM</Text>
            <Text style={styles.heroMetaValue}>
              {progress ? String(progress.total_km) : "0"}
            </Text>
          </View>

        </View>
      </View>

      {/* ---------- TRAVEL DETAILS ---------- */}
      <View style={styles.card}>
        <View style={styles.sectionHeadRow}>
          <View style={styles.accentBar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Travel Details</Text>
            <Text style={styles.cardSubtitle}>Auto-filled from your work session</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <AppInput
            label="Date"
            placeholder=""
            editable={false}
            value={progress ? dayjs(progress.report_date).format("DD MMM YYYY") : ""}
            onChangeText={() => {}}
          />


          <AppInput
            label="Total KM"
            placeholder=""
            editable={false}
            value={progress ? String(progress.total_km) : ""}
            onChangeText={() => {}}
          />
        </View>
      </View>

      {/* ---------- VISITS ---------- */}
      <View style={styles.visitsHeadRow}>
        <View style={styles.sectionHeadRow}>
          <View style={styles.accentBar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Visits</Text>
            <Text style={styles.cardSubtitle}>
              {entries.length ? `${entries.length} visit${entries.length > 1 ? "s" : ""} submitted today` : "Enter the first visit of the day"}
            </Text>
          </View>
        </View>

        <View style={styles.countChip}>
          <Text style={styles.countChipText}>{entries.length}</Text>
        </View>
      </View>

      {!isReadOnly ? (
        <>
          <ProgressRow
            index={entries.length}
            value={formRow}
            partyData={partyData}
            readOnly={false}
            onChange={(value) => setFormRow(value)}
            onDelete={() => {}}
            onSubmit={handleSubmitVisit}
            submitting={saving}
          />
          <Text style={styles.helperNote}>
            Fill in the visit details and tap “Submit Visit”. The form will clear automatically for the next visit.
          </Text>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Daily report submitted</Text>
          <Text style={styles.emptyText}>This report is read-only.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 44,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F8FC",
  },

  /* ---------- HERO ---------- */
  hero: {
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    marginBottom: 18,
    backgroundColor: "#0F76AE",
    overflow: "hidden",
    shadowColor: "#00416E",
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 8,
  },

  heroGlowOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -90,
    right: -60,
    backgroundColor: "rgba(255,255,255,0.13)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    bottom: -110,
    left: -70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  heroBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FFFFFF",
  },

  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  heroPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  heroPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  heroDate: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },

  heroDay: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#CFE8FF",
  },

  heroMetaRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },

  heroMetaTile: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },

  heroMetaLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#BFDFFA",
  },

  heroMetaValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* ---------- CARDS / SECTIONS ---------- */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8EFF6",
    shadowColor: "#0E4C77",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },

  accentBar: {
    width: 4,
    height: 30,
    borderRadius: 3,
    backgroundColor: "#1597D4",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16324F",
  },

  cardSubtitle: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#8697A8",
    marginTop: 3,
  },

  fieldGroup: {
    gap: 12,
    marginTop: 14,
  },

  visitsHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  countChip: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#E6F3FB",
    alignItems: "center",
  },

  countChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F76AE",
  },

  actionsRow: {
    gap: 12,
    marginBottom: 18,
  },

  /* ---------- EMPTY STATE ---------- */
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8EFF6",
    borderStyle: "dashed",
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F3FB",
  },

  emptyIconText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F76AE",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#16324F",
  },

  emptyText: {
    marginTop: 4,
    textAlign: "center",
    color: "#8697A8",
    fontSize: 12.5,
    fontWeight: "500",
  },

  helperNote: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B2",
    marginTop: 2,
  },
});
