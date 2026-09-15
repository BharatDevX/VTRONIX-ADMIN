import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../../theme/color";
import { RootStackParamList } from "../../../navigation/AppNavigator";

import { getSession } from "../../auth/services/session.service";
import { getEmployee } from "../../auth/services/employee.service";
import { useAuthStore } from "../../auth/store/auth.store";

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

export default function SplashScreen() {
  const navigation = useNavigation<NavProp>();

  const setEmployee = useAuthStore(
    (state) => state.setEmployee
  );

  // --- animation values (visual only, no logic impact) ---
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(8)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.35)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.22)).current;
  const sheenX = useRef(new Animated.Value(-1)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoOpacity, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Ambient pulsing ring behind the logo, loops forever
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, {
            toValue: 1.6,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.35,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Second, delayed ripple for depth (visual only)
    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 2.1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0.22,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Sheen sweep across the logo badge (visual only)
    Animated.loop(
      Animated.sequence([
        Animated.timing(sheenX, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(sheenX, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    initialize();
  }, []);

  async function initialize() {
    try {
      const session = await getSession();

      if (!session) {
        navigation.replace("Login");
        return;
      }

      const employee = await getEmployee(session.user.id);

      setEmployee(employee);

      navigation.replace("Home");
    } catch (error) {
      navigation.replace("Login");
    }
  }

  return (
    <View style={styles.container}>
      {/* soft ambient glows for depth */}
      <View pointerEvents="none" style={[styles.glow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom]} />

      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Animated.View
            style={[
              styles.ringOuter,
              {
                opacity: ring2Opacity,
                transform: [{ scale: ring2Scale }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />

          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              alignItems: "center",
            }}
          >
            <View style={styles.logoBadge}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.sheen,
                  {
                    transform: [
                      {
                        translateX: sheenX.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-70, 70],
                        }),
                      },
                      { rotate: "18deg" },
                    ],
                  },
                ]}
              />
              <Image style={styles.test} source={require("../../../../assets/images/logo.png")} />
            </View>

            <Text style={styles.logo}>Vetronix</Text>

            <View style={styles.accentBar} />
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.text,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          Employee App
        </Animated.Text>

        <Animated.View style={[styles.loaderPill, { opacity: loaderOpacity }]}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loaderText}>Preparing your workspace</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <Text style={styles.footerText}>Powered by Vetronix</Text>
        <Text style={styles.footerVersion}>Version 1.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  glow: {
    position: "absolute",
    borderRadius: 999,
  },

  glowTop: {
    width: 320,
    height: 320,
    top: -110,
    right: -90,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  glowBottom: {
    width: 380,
    height: 380,
    bottom: -150,
    left: -120,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  logoWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  ring: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
  },

  ringOuter: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  logoBadge: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },

  sheen: {
    position: "absolute",
    width: 26,
    height: 160,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  logoInitial: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 1,
  },

  logo: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  accentBar: {
    width: 42,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    marginTop: 10,
  },

  text: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    fontWeight: "600",
  },

  loaderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  loaderText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  footer: {
    alignItems: "center",
    paddingBottom: 34,
  },

  footerText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  footerVersion: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 3,
  },
  test: {
    width: 100,
    height: 100,
  }
});
