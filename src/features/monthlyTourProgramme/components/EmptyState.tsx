import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface Props {
  onAddTour: () => void;
}

export default function EmptyState({
  onAddTour,
}: Props) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">
        No Tour Planned
      </Text>

      <Text
        variant="bodyMedium"
        style={styles.subtitle}
      >
        Start planning your monthly tour by
        adding your first tour.
      </Text>

      <Button
        mode="contained"
        icon="plus"
        onPress={onAddTour}
        style={styles.button}
      >
        Add First Tour
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    opacity: 0.7,
  },

  button: {
    borderRadius: 12,
  },
});