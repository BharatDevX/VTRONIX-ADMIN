import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
} from "react-native";

interface AppCardProps {
  children: ReactNode;
}

export default function AppCard({
  children,
}: AppCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
});