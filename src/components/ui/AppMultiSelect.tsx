import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { Check } from "lucide-react-native";

interface Props {
  label: string;
  data: any[];
  value: any[];
  labelField: string;
  valueField: string;
  onChange: (items: any[]) => void;
}

export default function AppMultiSelect({
  label,
  data,
  value,
  labelField,
  valueField,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <MultiSelect
        style={styles.dropdown}
        data={data}
        search
        labelField={labelField}
        valueField={valueField}
        placeholder={`Select ${label}`}
        searchPlaceholder="Search..."
        value={value}
        onChange={onChange}

        // Show a green tick beside selected products
        renderItem={(item, selected) => (
          <View
            style={[
              styles.itemContainer,
              selected && styles.selectedItem,
            ]}
          >
            <Text
              style={[
                styles.itemText,
                selected && styles.selectedItemText,
              ]}
            >
              {item[labelField]}
            </Text>

            {selected && (
              <View style={styles.checkContainer}>
                <Check
                  size={20}
                  color="#16A34A"
                  strokeWidth={3}
                />
              </View>
            )}
          </View>
        )}
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
    minHeight: 55,
  },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 50,
  },

  selectedItem: {
    backgroundColor: "#F0FDF4",
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    color: "#1A1D1F",
  },

  selectedItemText: {
    fontWeight: "600",
  },

  checkContainer: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCFCE7",
  },
});