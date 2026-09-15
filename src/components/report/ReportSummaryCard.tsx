import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  value: string | number;
}

export default function ReportSummaryCard({
  title,
  value,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    margin: 6,
  },
  title: {
    color: "#666",
    fontSize: 14,
  },
  value: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
  },
});