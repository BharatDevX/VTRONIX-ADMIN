import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, View } from "react-native";
import { Button, Portal, Text, TextInput, SegmentedButtons } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import { MonthlyTourEntry } from "../types/monthlyTourProgramme.types";
import { INDIAN_CITIES } from "../constants/indiancities";

interface Props {
  visible: boolean;
  entry?: MonthlyTourEntry | null;
  onClose: () => void;
  onSave: (data: {
    tour_date: string;
    hq_ex_tour: "HQ" | "EX" | "TOUR";
    route_plan_details: string;
    start_location: string;
    end_location: string;
    checkpoints: string[];
    total_km: number;
    travel_mode: string;
    route_no: string;
    note: string | null;
  }) => void;
}

const CITY_OPTIONS = INDIAN_CITIES.map((city) => ({ label: city, value: city }));

function parseRoute(route: string) {
  const parts = route
    .split(/\s*(?:→|->|—)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      start: parts[0],
      end: parts[parts.length - 1],
      checkpoints: parts.slice(1, -1),
    };
  }

  return { start: route.trim(), end: "", checkpoints: [] as string[] };
}

export default function TourEntryForm({ visible, entry, onClose, onSave }: Props) {
  const [tourDate, setTourDate] = useState("");
  const [type, setType] = useState<"HQ" | "EX" | "TOUR">("HQ");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [checkpoints, setCheckpoints] = useState<string[]>([]);
  const [travelMode, setTravelMode] = useState("");
  const [km, setKm] = useState("");
  const [routeNo, setRouteNo] = useState("");
  const [note, setNote] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (entry) {
      const parsed = parseRoute(entry.route_plan_details ?? "");
      setTourDate(entry.tour_date);
      setType(entry.hq_ex_tour);
      setStartLocation(entry.start_location || parsed.start);
      setEndLocation(entry.end_location || parsed.end);
      setCheckpoints(entry.checkpoints?.length ? entry.checkpoints : parsed.checkpoints);
      setTravelMode(entry.travel_mode ?? "");
      setKm(String(entry.total_km ?? ""));
      setRouteNo(entry.route_no ?? "");
      setNote(entry.note ?? "");
    } else {
      setTourDate("");
      setType("HQ");
      setStartLocation("");
      setEndLocation("");
      setCheckpoints([]);
      setTravelMode("");
      setKm("");
      setRouteNo("");
      setNote("");
    }
  }, [entry, visible]);

  const routeDetails = useMemo(
    () => [startLocation, ...checkpoints, endLocation].filter(Boolean).join(" → "),
    [startLocation, checkpoints, endLocation]
  );

  const addCheckpoint = () => setCheckpoints((current) => [...current, ""]);

  const updateCheckpoint = (index: number, value: string) => {
    setCheckpoints((current) => current.map((item, i) => (i === index ? value : item)));
  };

  const removeCheckpoint = (index: number) => {
    setCheckpoints((current) => current.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!tourDate) {
      Alert.alert("Missing date", "Please select the tour date.");
      return;
    }
    if (!startLocation || !endLocation) {
      Alert.alert("Route required", "Please select both start and end locations.");
      return;
    }
    if (checkpoints.some((checkpoint) => !checkpoint)) {
      Alert.alert("Checkpoint required", "Please select a city for every checkpoint or remove the empty checkpoint.");
      return;
    }
    if (!travelMode) {
      Alert.alert("Travel mode required", "Please select a travel mode.");
      return;
    }

    onSave({
      tour_date: tourDate,
      hq_ex_tour: type,
      route_plan_details: routeDetails,
      start_location: startLocation,
      end_location: endLocation,
      checkpoints,
      total_km: Number(km) || 0,
      travel_mode: travelMode,
      route_no: routeNo.trim(),
      note: note.trim() || null,
    });
    onClose();
  };

  const renderCityDropdown = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string
  ) => (
    <View style={styles.input}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.itemTextStyle}
        containerStyle={styles.dropdownContainer}
        activeColor="#E7F7F0"
        data={CITY_OPTIONS}
        search
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder="Search city..."
        value={value}
        onChange={(item) => onChange(item.value)}
      />
    </View>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.grabber} />
              <Text style={styles.eyebrow}>Monthly Tour Programme</Text>
              <Text style={styles.title}>{entry ? "Edit Tour" : "Add Tour"}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              <Text style={styles.label}>Tour Date</Text>
              <TextInput
                mode="outlined"
                label="Tour Date"
                value={tourDate}
                editable={false}
                outlineColor="#E3E8F0"
                activeOutlineColor="#1D9C6E"
                outlineStyle={styles.inputOutline}
                style={styles.field}
                right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
              />
              {showDatePicker && (
                <DateTimePicker
                  value={tourDate ? new Date(`${tourDate}T00:00:00`) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) setTourDate(selectedDate.toISOString().split("T")[0]);
                  }}
                />
              )}

              <View style={styles.input}>
                <Text style={styles.label}>Visit Type</Text>
                <SegmentedButtons
                  value={type}
                  onValueChange={(v) => setType(v as "HQ" | "EX" | "TOUR")}
                  buttons={[
                    { value: "HQ", label: "HQ", icon: "office-building" },
                    { value: "EX", label: "EX", icon: "map-marker-radius" },
                    { value: "TOUR", label: "Tour", icon: "car" },
                  ]}
                />
              </View>

              <Text style={styles.label}>Route No</Text>
              <TextInput
                label="Route No"
                value={routeNo}
                onChangeText={setRouteNo}
                mode="outlined"
                outlineColor="#E3E8F0"
                activeOutlineColor="#1D9C6E"
                outlineStyle={styles.inputOutline}
                style={[styles.field, styles.input]}
              />

              <Text style={styles.label}>Route</Text>
              {renderCityDropdown("Start Location", startLocation, setStartLocation, "Select start city")}

              {checkpoints.map((checkpoint, index) => (
                <View style={styles.checkpointRow} key={`checkpoint-${index}`}>
                  <View style={styles.checkpointField}>
                    {renderCityDropdown(`Checkpoint ${index + 1}`, checkpoint, (value) => updateCheckpoint(index, value), "Select checkpoint city")}
                  </View>
                  <Button
                    mode="text"
                    compact
                    textColor="#D32F2F"
                    onPress={() => removeCheckpoint(index)}
                    style={styles.removeCheckpoint}
                  >
                    Remove
                  </Button>
                </View>
              ))}

              <Button mode="outlined" icon="plus" onPress={addCheckpoint} style={styles.addCheckpoint}>
                Add Checkpoint
              </Button>

              {renderCityDropdown("End Location", endLocation, setEndLocation, "Select end city")}

              <View style={styles.pairRow}>
                <View style={styles.pairItem}>
                  <Text style={styles.label}>Total KM</Text>
                  <TextInput
                    label="Total KM"
                    value={km}
                    onChangeText={setKm}
                    keyboardType="numeric"
                    mode="outlined"
                    outlineColor="#E3E8F0"
                    activeOutlineColor="#1D9C6E"
                    outlineStyle={styles.inputOutline}
                    style={[styles.field, styles.input]}
                  />
                </View>
                <View style={styles.pairItem}>
                  <Text style={styles.label}>Travel Mode</Text>
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={styles.dropdownContainer}
                    activeColor="#E7F7F0"
                    data={["Bike", "Car", "Bus", "Train", "Flight", "Walk"].map((value) => ({ label: value, value }))}
                    labelField="label"
                    valueField="value"
                    placeholder="Select mode"
                    value={travelMode}
                    onChange={(item) => setTravelMode(item.value)}
                  />
                </View>
              </View>

              <View style={styles.routePreview}>
                <Text style={styles.routePreviewLabel}>ROUTE PREVIEW</Text>
                <Text style={styles.routePreviewText}>{routeDetails || "Start → Checkpoint → End"}</Text>
              </View>

              <Text style={styles.label}>Note / Remark (Optional)</Text>
              <TextInput
                label="Note / Remark"
                value={note}
                onChangeText={setNote}
                mode="outlined"
                multiline
                numberOfLines={3}
                outlineColor="#E3E8F0"
                activeOutlineColor="#1D9C6E"
                outlineStyle={styles.inputOutline}
                style={[styles.field, styles.noteInput, styles.input]}
                placeholder="Add any note or remark for this tour"
              />

              <View style={styles.buttons}>
                <Button mode="outlined" icon="close" onPress={onClose} style={styles.actionButton} contentStyle={styles.actionContent} labelStyle={styles.actionLabel} textColor="#6B7280">
                  Cancel
                </Button>
                <Button mode="contained" icon="content-save" onPress={handleSave} style={styles.actionButton} contentStyle={styles.actionContent} labelStyle={styles.actionLabel} buttonColor="#1D9C6E" textColor="#FFFFFF">
                  Save Tour
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: "rgba(11,18,32,0.32)", justifyContent: "center" },
  container: { backgroundColor: "#FFFFFF", margin: 18, borderRadius: 24, paddingHorizontal: 20, paddingBottom: 20, maxHeight: "90%", overflow: "hidden", elevation: 6 },
  header: { paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F1F4F9", marginBottom: 16 },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 3, backgroundColor: "#E3E8F0", marginBottom: 14 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 0.9, textTransform: "uppercase", color: "#8A8F98" },
  title: { marginTop: 4, fontSize: 21, fontWeight: "800", color: "#101418", letterSpacing: -0.4 },
  body: { paddingBottom: 6 },
  field: { backgroundColor: "#F8FAFC" },
  inputOutline: { borderRadius: 14, borderWidth: 1 },
  input: { marginBottom: 14 },
  label: { marginBottom: 8, fontSize: 11.5, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: "#8A8F98" },
  dropdown: { borderWidth: 1, borderColor: "#E3E8F0", borderRadius: 14, paddingHorizontal: 14, height: 55, backgroundColor: "#F8FAFC" },
  placeholderStyle: { color: "#9AA1AC", fontSize: 14.5 },
  selectedTextStyle: { color: "#101418", fontSize: 14.5, fontWeight: "600" },
  itemTextStyle: { color: "#101418", fontSize: 14.5 },
  inputSearchStyle: { height: 44, borderRadius: 10, borderColor: "#E3E8F0", color: "#101418" },
  dropdownContainer: { borderRadius: 14, borderColor: "#EEF1F6", overflow: "hidden" },
  checkpointRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  checkpointField: { flex: 1 },
  removeCheckpoint: { marginBottom: 14 },
  addCheckpoint: { marginBottom: 14, borderRadius: 12 },
  pairRow: { flexDirection: "row", gap: 12 },
  pairItem: { flex: 1 },
  routePreview: { marginTop: 2, marginBottom: 4, padding: 14, borderRadius: 14, backgroundColor: "#EAF7F1", borderWidth: 1, borderColor: "#D5EFE3" },
  routePreviewLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.7, color: "#1D9C6E", marginBottom: 5 },
  routePreviewText: { fontSize: 14, fontWeight: "700", color: "#20352D", lineHeight: 20 },
  noteInput: { minHeight: 90, textAlignVertical: "top" },
  buttons: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 14, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F1F4F9" },
  actionButton: { flex: 1, borderRadius: 999, borderColor: "#E3E8F0" },
  actionContent: { paddingVertical: 4 },
  actionLabel: { fontWeight: "700" },
});
