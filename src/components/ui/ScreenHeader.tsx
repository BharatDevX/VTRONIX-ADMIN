import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Colors from "../../theme/color";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({
  title,
  subtitle,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 16,
    color: "#666",
  },
});