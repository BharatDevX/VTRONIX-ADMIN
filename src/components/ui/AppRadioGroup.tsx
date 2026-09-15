import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import colors from "../../theme/color";
interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export default function AppRadioGroup({
  value,
  options,
  onChange,
}: Props) {
  return (
    <View>
      {options.map((item) => {
        const selected = value === item.value;

        return (
          <TouchableOpacity
            key={item.value}
            style={styles.row}
            onPress={() => onChange(item.value)}
          >
            <View
              style={[
                styles.circle,
                selected && styles.selected,
              ]}
            />

            <Text style={styles.label}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  circle: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
  },

  selected: {
    backgroundColor: colors.primary,
  },

  label: {
    fontSize: 16,
  },
});