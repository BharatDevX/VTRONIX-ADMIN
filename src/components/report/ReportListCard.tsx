import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ReportListCard({
  title,
  children,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
});