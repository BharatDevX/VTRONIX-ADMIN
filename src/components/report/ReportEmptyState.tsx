import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  message: string;
}

export default function ReportEmptyState({
  message,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: "center",
  },
  text: {
    color: "#777",
    fontSize: 16,
  },
});