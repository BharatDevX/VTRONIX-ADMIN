import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Easing,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// NOTE: relies on `expo-linear-gradient`. This ships with almost every Expo
// managed app already; if it isn't installed yet, add it with:
//   npx expo install expo-linear-gradient
import { LinearGradient } from "expo-linear-gradient";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../navigation/AppNavigator";

import { useAuth } from "../hooks/useAuth";

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

// Premium corporate palette, per design spec.
const PALETTE = {
  primary: "#1565C0",
  secondary: "#42A5F5",
  background: "#F5FAFF",
  accent: "#E3F2FD",
  text: "#0F172A",
  border: "#D6E4F0",
};



export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();

  const [employeeId, setEmployeeId] = useState("");
const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const employeeIdInputRef = useRef<TextInput>(null);
const passwordInputRef = useRef<TextInput>(null);
  const { signIn, loading } = useAuth();

  // --- animation values (visual only, no logic impact) ---
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(28)).current;
  const field1Opacity = useRef(new Animated.Value(0)).current;
  const field1TranslateY = useRef(new Animated.Value(12)).current;
  const field2Opacity = useRef(new Animated.Value(0)).current;
  const field2TranslateY = useRef(new Animated.Value(12)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(12)).current;
  const buttonPressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(110, [
        Animated.parallel([
          Animated.timing(field1Opacity, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(field1TranslateY, {
            toValue: 0,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(field2Opacity, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(field2TranslateY, {
            toValue: 0,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(buttonTranslateY, {
            toValue: 0,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  // Unchanged: same signIn() call, same success navigation, same state.
  async function handleLogin() {
    const success = await signIn(
      employeeId.trim(),
      password
    );

    if (success) {
      navigation.replace("Home");
    }
  }

  function handlePressIn() {
    Animated.timing(buttonPressScale, {
      toValue: 0.97,
      duration: 90,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(buttonPressScale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }

  return (
    <View style={styles.container}>
      {/* Soft corporate gradient backdrop with subtle blurred shapes */}
      <LinearGradient
        colors={[PALETTE.accent, PALETTE.background, "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Full client-provided banner: logo + name + "veterinary medicine" pill, all in one image */}
          <Animated.View
            style={[
              styles.brandWrap,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.bannerGlass}>
              <Image
                source={require("../../../../assets/images/vetronix-banner.png")}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your daily field operations.
            </Text>

            <View style={styles.form}>

  {/* EMPLOYEE ID */}
  <Animated.View
    style={{
      opacity: field1Opacity,
      transform: [{ translateY: field1TranslateY }],
    }}
  >
    <View style={styles.inputWrap}>
      <View style={styles.inputIconWrap}>
        <Ionicons
          name="person-outline"
          size={19}
          color="#94A3B8"
        />
      </View>

      <TextInput
        ref={employeeIdInputRef}
        value={employeeId}
        onChangeText={setEmployeeId}
        placeholder="Enter Employee ID"
        placeholderTextColor="#9AA7B8"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={false}
        textContentType="none"
        autoComplete="off"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => {
          requestAnimationFrame(() => {
            passwordInputRef.current?.focus();
          });
        }}
        style={styles.input}
      />
    </View>
  </Animated.View>


  {/* PASSWORD */}
  <Animated.View
    style={{
      opacity: field2Opacity,
      transform: [{ translateY: field2TranslateY }],
    }}
  >
    <View style={styles.inputWrap}>
      <View style={styles.inputIconWrap}>
        <Ionicons
          name="lock-closed-outline"
          size={19}
          color="#94A3B8"
        />
      </View>

      <TextInput
        ref={passwordInputRef}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Password"
        placeholderTextColor="#9AA7B8"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={false}
        textContentType="password"
        autoComplete="password"
        returnKeyType="done"
        blurOnSubmit={true}
        onSubmitEditing={handleLogin}
        style={styles.input}
      />

      <Pressable
        onPress={() => setShowPassword((visible) => !visible)}
        hitSlop={10}
        style={styles.passwordToggle}
        accessibilityRole="button"
        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
      >
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={21}
          color="#94A3B8"
        />
      </Pressable>
    </View>
  </Animated.View>

</View>
            <Animated.View
              style={{
                opacity: buttonOpacity,
                transform: [
                  { translateY: buttonTranslateY },
                  { scale: buttonPressScale },
                ],
              }}
            >
              <Pressable
                onPress={handleLogin}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                android_ripple={{ color: "rgba(255,255,255,0.25)" }}
                style={styles.buttonShadowWrap}
              >
                <LinearGradient
                  colors={[PALETTE.primary, PALETTE.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>SIGN IN</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>

            <View style={styles.secureRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" />
              <Text style={styles.secureText}>
                Secure Login · 256-bit encrypted authentication
              </Text>
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Vetronix</Text>
            <Text style={styles.footerVersion}>Version 1.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },

  flex: {
    flex: 1,
  },

  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.35,
  },

  blobTop: {
    width: 260,
    height: 260,
    backgroundColor: "#BBDEFB",
    top: -80,
    right: -70,
  },

  blobBottom: {
    width: 320,
    height: 320,
    backgroundColor: PALETTE.accent,
    bottom: -120,
    left: -90,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  brandWrap: {
    alignItems: "center",
    marginBottom: 20,
  },

  bannerGlass: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },

  bannerImage: {
    width: "100%",
    height: 130,
  },

  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 6,
  },

  welcomeTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: PALETTE.text,
  },

  welcomeSubtitle: {
    fontSize: 13.5,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 19,
  },

  form: {
    gap: 14,
    marginTop: 24,
    marginBottom: 22,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.4,
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 56,
    backgroundColor: "#FBFDFF",
  },

  inputIconWrap: {
    width: 26,
    alignItems: "center",
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.text,
    paddingVertical: 0,
    height: "100%",
  },

  passwordToggle: {
    width: 38,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  buttonShadowWrap: {
    borderRadius: 999,
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },

  button: {
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },

  secureText: {
    fontSize: 11.5,
    color: "#94A3B8",
    fontWeight: "500",
  },

  footer: {
    alignItems: "center",
    marginTop: 28,
  },

  footerText: {
    fontSize: 12.5,
    color: "#8A8F98",
    letterSpacing: 0.2,
    fontWeight: "600",
  },

  footerVersion: {
    fontSize: 11,
    color: "#B0B7C3",
    marginTop: 3,
  },
  inputWrapFocused: {
  borderColor: PALETTE.primary,
  shadowColor: PALETTE.primary,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
},
});