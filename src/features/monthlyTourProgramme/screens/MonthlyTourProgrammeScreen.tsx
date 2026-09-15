import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FAB,
  Searchbar,
  SegmentedButtons,
  Button,
} from "react-native-paper";

import { useAuthStore } from "../../auth/store/auth.store";
import { useFocusEffect } from "@react-navigation/native";

import { useMonthlyTourProgramme } from "../../monthlyTourProgramme/hooks/useMonthlTourProgramme";

import TourHeader from "../components/TourHeader";
import SummaryCard from "../components/SummaryCard";
import EmptyState from "../components/EmptyState";
import TourEntryCard from "../components/TourEntryCard";
import TourEntryForm from "../components/TourEntryForm";

import { MonthlyTourEntry } from "../types/monthlyTourProgramme.types";
import { useMonthlyTourProgrammeStore } from "../store/monthlyTouProgramme.store";

export default function MonthlyTourProgrammeScreen() {
  const { employee } = useAuthStore();

  const {
    programme,
    entries,
    summary,
    loading,
    refresh,
    add,
    update,
    remove,
    submit,
    canEdit,
    create,
  } = useMonthlyTourProgramme();

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "ALL" | "HQ" | "EX" | "TOUR"
  >("ALL");

  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [editingEntry, setEditingEntry] =
    useState<MonthlyTourEntry | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  
useFocusEffect(
  React.useCallback(() => {
    if (!employee) return;

    void refresh(
      employee.id,
      currentMonth,
      currentYear
    );
  }, [employee, currentMonth, currentYear])
);
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.route_plan_details
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL"
          ? true
          : entry.hq_ex_tour === filter;

      return matchesSearch && matchesFilter;
    });
  }, [entries, search, filter]);

  const onRefresh = async () => {
    if (!employee) return;

    setRefreshing(true);

    await refresh(
      employee.id,
      currentMonth,
      currentYear
    );

    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#1D9C6E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1D9C6E"
            colors={["#1D9C6E"]}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TourHeader
          programme={programme}
          employeeName={employee?.full_name ?? ""}
        />

        <SummaryCard summary={summary} />

        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filters</Text>

          <Searchbar
            placeholder="Search Route..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
            inputStyle={styles.searchInput}
            iconColor="#8A8F98"
            placeholderTextColor="#9AA1AC"
            elevation={0}
          />

          <SegmentedButtons
            value={filter}
            onValueChange={(v) =>
              setFilter(v as any)
            }
            style={styles.segments}
            buttons={[
              {
                value: "ALL",
                label: "All",
              },
              {
                value: "HQ",
                label: "HQ",
              },
              {
                value: "EX",
                label: "EX",
              },
              {
                value: "TOUR",
                label: "Tour",
              },
            ]}
          />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tour Entries</Text>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {filteredEntries.length}
            </Text>
          </View>
        </View>

       {filteredEntries.length === 0 ? (
    (!programme || canEdit) ? (
        <EmptyState
            onAddTour={() => {
                setEditingEntry(null);
                setModalVisible(true);
            }}
        />
    ) : (
        <View style={styles.noEntries}>
            <View style={styles.noEntriesGlyphWrap}>
                <Text style={styles.noEntriesGlyph}>🗓️</Text>
            </View>

            <Text style={styles.noEntriesText}>
                No tour entries for this programme.
            </Text>
        </View>
    )
) : (
  <>
    {filteredEntries.map((entry) => (
      <TourEntryCard
        key={entry.id}
        entry={entry}
        editable={canEdit}
        onEdit={(tour) => {
          // Editing is only ever wired up via a visible Edit button, which
          // TourEntryCard already hides when `editable` (canEdit) is false.
          // This check is a defense-in-depth guard reusing that same flag.
          if (!canEdit) return;
          setEditingEntry(tour);
          setModalVisible(true);
        }}
        onDelete={(id) => {
          if (!canEdit) return;
          remove(id);
        }}
      />
    ))}
  </>
)}

{canEdit && entries.length > 0 && (
  <Button
    mode="contained"
    icon="send"
    style={styles.submitButton}
    contentStyle={styles.buttonContent}
    labelStyle={styles.buttonLabel}
    buttonColor="#1D9C6E"
    textColor="#FFFFFF"
    onPress={submit}
  >
    Submit Monthly Programme
  </Button>
)}

{entries.length > 0 && (
  <Button
    mode="outlined"
    icon="file-pdf-box"
    style={styles.pdfButton}
    contentStyle={styles.buttonContent}
    labelStyle={styles.buttonLabel}
    textColor="#3C4350"
    onPress={() => {
      // TODO:
      // Generate PDF
    }}
  >
    Generate PDF
  </Button>
)}
      </ScrollView>

      {(!programme || canEdit) && (
    <FAB
        icon="plus"
        color="#FFFFFF"
        style={styles.fab}
        onPress={() => {
            setEditingEntry(null);
            setModalVisible(true);
        }}
    />
)}
      <TourEntryForm
  visible={modalVisible}
  entry={editingEntry}
  onClose={() => {
    setModalVisible(false);
    setEditingEntry(null);
  }}
  onSave={async (data) => {
    if (!employee) return;

    // Defense-in-depth: the form can only be opened via the FAB, the
    // EmptyState "Add" button, or a card's Edit button, all of which are
    // already gated on `canEdit`. This reuses the same flag rather than
    // introducing new logic.
  if (programme && !canEdit) {
  Alert.alert(
    "Monthly Tour Programme",
    "This programme can no longer be edited."
  );
  return;
}

    let currentProgramme = programme;

    if (!currentProgramme) {
      await refresh(employee.id, currentMonth, currentYear);
      currentProgramme = programme;
    }

    if (!currentProgramme) {
      await create({
  employee_id: employee.id,
  month: currentMonth,
  year: currentYear,
});

await refresh(
  employee.id,
  currentMonth,
  currentYear
);

currentProgramme =
  useMonthlyTourProgrammeStore
    .getState()
    .programme;
    }

    if (!currentProgramme) {
      return;
    }

    if (editingEntry) {
      await update(editingEntry.id, data);
    } else {
      try {
  console.log("Saving Tour", {
    programme_id: currentProgramme.id,
    sequence_no: entries.length + 1,
    ...data,
  });

  await add({
    programme_id: currentProgramme.id,
    sequence_no: entries.length + 1,
    ...data,
    note: null
  });

  console.log("SUCCESS");

  setModalVisible(false);
  setEditingEntry(null);
} catch (e) {
  console.error("ADD TOUR ERROR", e);
  Alert.alert(
    "Error",
    e instanceof Error ? e.message : JSON.stringify(e)
  );
}
    }

    setModalVisible(false);
    setEditingEntry(null);
  }}
/>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  content: {
    padding: 18,
    paddingBottom: 120,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF1F6",
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  filterTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#8A8F98",
    marginBottom: 12,
  },

  search: {
    backgroundColor: "#F5F7FA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF1F6",
    marginBottom: 14,
  },

  searchInput: {
    fontSize: 14.5,
    color: "#101418",
    minHeight: 0,
  },

  segments: {
    borderRadius: 12,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#6B7280",
  },

  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#EEF1F6",
  },

  countPillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#6B7280",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    borderRadius: 20,
    backgroundColor: "#1D9C6E",
  },

  submitButton: {
  marginTop: 20,
  borderRadius: 999,
},

pdfButton: {
  marginTop: 12,
  marginBottom: 30,
  borderRadius: 999,
  borderColor: "#E3E8F0",
  backgroundColor: "#FFFFFF",
},

buttonContent: {
  paddingVertical: 6,
},

buttonLabel: {
  fontWeight: "700",
  letterSpacing: 0.2,
},

noEntries: {
  paddingVertical: 32,
  paddingHorizontal: 24,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#EEF1F6",
},

noEntriesGlyphWrap: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#F1F4F9",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
},

noEntriesGlyph: {
  fontSize: 24,
},

noEntriesText: {
  textAlign: "center",
  fontSize: 13.5,
  color: "#8A8F98",
},
});
