import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  Text,
  Animated,
  Easing,
} from "react-native";
import Colors from "../../../theme/color";
import PrimaryButton from "../../../components/ui/PrimaryButton";

import { useAuthStore } from "../../auth/store/auth.store";
import { useWork } from "../hooks/useWork";
import { locationTrackingService } from "../../../services/location/LocationTrackingService";

export default function EndWorkScreen() {
  const employee = useAuthStore((state) => state.employee);
  const employeeId = employee?.id ?? "";

  const { session, loading, saving, loadSession, endWork } = useWork(employeeId);

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (employeeId) {
      void loadSession();
    }
  }, [employeeId, loadSession]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading]);

  async function handleEnd() {
    if (!employeeId || saving) {
      return;
    }

    try {
      if (!session || session.status !== "started") {
        Alert.alert("Error", session?.status === "completed" ? "Today's work already completed." : "Please start work first.");
        return;
      }

      const permissionGranted = await locationTrackingService.requestPermissions();

      if (!permissionGranted) {
        Alert.alert("Permission Required", "Please allow location access.");
        return;
      }

      const location = await locationTrackingService.getCurrentLocation();
      const result = await endWork({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (result) {
        Alert.alert("Success", "Work completed successfully.");
      }
    } catch (error: unknown) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to complete work.");
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const buttonTitle = session?.status === "started"
    ? "END WORK"
    : session?.status === "completed"
      ? "WORK ALREADY COMPLETED"
      : "START WORK FIRST";

  const statusMeta = session?.status === "started"
    ? { label: "In Progress", color: "#1D9C6E" }
    : session?.status === "completed"
      ? { label: "Completed", color: "#6B7280" }
      : { label: "Not Started", color: "#C79A1E" };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        <Text style={styles.title}>End Work</Text>
        <Text style={styles.description}>
          Press the button to capture your current location and complete your work session.
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIconWrap}>
            <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.statusLabel}>Session Status</Text>
            <Text style={[styles.statusValue, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
        </View>

        <PrimaryButton
          title={buttonTitle}
          disabled={session?.status !== "started" || saving}
          loading={saving}
          onPress={handleEnd}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 30,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 21,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F6FA",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 12.5,
    color: "#8A8F98",
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});