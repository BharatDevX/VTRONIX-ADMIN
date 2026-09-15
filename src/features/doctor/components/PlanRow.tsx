import React from "react";
import { View, StyleSheet } from "react-native";
import AppInput from "../../../components/ui/AppInput";
import AppSearchDropdown from "../../../components/ui/AppSearchDropdown";
import AppDatePicker from "../../../components/ui/AppDatePicker";

interface Props {
  value: any;
  doctors: any[];
  onChange: (field: string, value: any) => void;
}

export default function PlanRow({ value, doctors, onChange }: Props) {
  return (
    <View style={styles.card}>
      <AppSearchDropdown
        label="Doctor"
        data={doctors}
        labelField="doctor_name"
        valueField="id"
        value={value.doctor_id}
        onChange={(item: any) => onChange("doctor_id", item.id)}
      />

      <AppInput
        label="Location"
        value={value.location}
        onChangeText={(text) => onChange("location", text)}
        placeholder=""
      />

      <AppDatePicker
        label="Planned Date"
        value={value.planned_date}
        onChange={(date: any) => onChange("planned_date", date)}
      />

      <AppInput
        label="Notes"
        value={value.reply}
        onChangeText={(text: string) => onChange("reply", text.slice(0, 1000))}
        placeholder=""
        multiline
        numberOfLines={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: "#FFF",
    elevation: 2,
  },
});
