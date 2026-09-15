import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface Props {
  label: string;
  data: any[];
  value: any;
  labelField: string;
  valueField: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (item: any) => void;
}

export default function AppSearchDropdown({
  label,
  data,
  value,
  labelField,
  valueField,
  placeholder,
  disabled,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Dropdown
        style={styles.dropdown}
        data={data}
        search
        maxHeight={300}
        labelField={labelField}
        valueField={valueField}
        placeholder={placeholder ?? `Select ${label}`}
        searchPlaceholder="Search..."
        value={value}
        disable={disabled}
        onChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
});