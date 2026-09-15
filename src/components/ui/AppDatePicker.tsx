import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

interface Props {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

export default function AppDatePicker({
  label,
  value,
  onChange,
}: Props) {
  const [show, setShow] = useState(false);

  const selectedDate = value ? new Date(value) : new Date();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={styles.input}
        onPress={() => setShow(true)}
      >
        <Text>
          {dayjs(selectedDate).format("DD MMM YYYY")}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShow(false);

            if (date) {
              onChange(dayjs(date).format("YYYY-MM-DD"));
            }
          }}
        />
      )}
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

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
  },
});