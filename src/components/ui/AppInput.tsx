import React from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
} from "react-native";

import Colors from "../../theme/color";

import { KeyboardTypeOptions } from "react-native";

interface AppInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
}
export default function AppInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
}: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
    placeholder={placeholder}
    placeholderTextColor="#999"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    editable={editable}
    multiline={multiline}
    numberOfLines={numberOfLines}
    keyboardType={keyboardType}
    style={[
        styles.input,
        multiline && styles.multiline,
    ]}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    fontSize: 16,
  },
  multiline: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
});