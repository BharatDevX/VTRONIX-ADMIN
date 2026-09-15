import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,

  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  LogOut,
  Route,
  Stethoscope,
  TrendingUp,
  ShoppingCart,
  Truck,
} from "lucide-react-native";
import dayjs from "dayjs";
import { UserCircle } from "lucide-react-native";
import Colors from "../../../theme/color";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import { getTodayAttendance } from "../../attendance/services/attendance.service";
import { getMonthlySalesSummary } from "../../sales/services/sales.service";
import { Attendance } from "../../attendance/types/attendance.types";
import { useAuthStore } from "../../auth/store/auth.store";
import { logout } from "../../auth/services/auth.service";
import { workService } from "../../work/services/work.service";
import { WorkSession } from "../../work/types/work.types";
import { resolveProfileImageUrl } from "../../profile/services/employeeProfile.service";
import {
  MapPinned,
} from "lucide-react-native";
type HomeNavigation = NativeStackNavigationProp<RootStackParamList>;
type MenuRoute = Exclude<keyof RootStackParamList, "Splash" | "Login" | "Home">;
type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

interface MenuItem {
  title: string;
  route: MenuRoute;
  icon: IconComponent;
}

interface MenuCardProps {
  title: string;
  icon: IconComponent;
  onPress: () => void;
}

interface StatisticCardProps {
  label: string;
  value: string;
  icon: IconComponent;
}

// Replaced with the actual Vetronix company logo (transparent PNG).
const HEADER_IMAGE = require("../../../../assets/images/logo.png");

const MENU_CATEGORIES: { title: string; items: MenuItem[] }[] = [
  {
    title: "Attendance",
    items: [
      { title: "Attendance", route: "Attendance", icon: CalendarCheck },
    ],
  },
  {
    title: "Daily Progress",
    items: [
      { title: "Daily Progress", route: "DailyProgress", icon: TrendingUp },
      { title: "Visit", route: "Visit", icon: Stethoscope },
    ],
  },
  {
    title: "Monthly Programme",
    items: [
      { title: "Monthly Tour Programme", route: "MonthlyTourProgramme", icon: MapPinned },
      { title: "Monthly Meeting Plan", route: "MeetingPlan", icon: ClipboardList },
    ],
  },
  {
    title: "Order and Sales",
    items: [
      { title: "Order Form", route: "SalesEntry", icon: ShoppingCart },
      { title: "Counter Sales", route: "CounterSaleReport", icon: FileBarChart },
      { title: "Doctor Sales", route: "DoctorWiseSalesReport", icon: Stethoscope },
      { title: "Secondary Sales", route: "SecondarySalesReport", icon: FileBarChart },
    ],
  },
  {
    title: "Reports",
    items: [
      { title: "Incentive Calculation", route: "IncentiveDashboard", icon: BadgeDollarSign },
      { title: "Order Delivery Status", route: "OrderDeliveryStatus", icon: Truck },
    ],
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
}

function getAttendanceLabel(attendanceValue: Attendance | null) {
  if (!attendanceValue) {
    return "Not Marked";
  }

  switch (attendanceValue.status) {
    case "PRESENT":
      return "Present";
    case "HALF_DAY":
      return "Half Day";
    case "LEAVE":
    case "ABSENT":
      return "Leave";
    default:
      return "Not Marked";
  }
}

function getWorkStatus(session: WorkSession | null) {
  if (!session) {
    return "Not Started";
  }

  if (session.status === "completed") {
    return "Completed";
  }

  return "Started";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load dashboard.";
}

export default function HomeScreen() {
  const employee = useAuthStore((state) => state.employee);
  const navigation = useNavigation<HomeNavigation>();

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [workSession, setWorkSession] = useState<WorkSession | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [monthlySales, setMonthlySales] = useState({ achieved: 0, target: 0 });

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  const loadDashboard = useCallback(async () => {
    if (!employee) {
      return;
    }

    setDashboardLoading(true);

    try {
      const [attendanceResult, workResult, profileImageResult, todaySalesResult] = await Promise.all([
        getTodayAttendance(employee.id),
        workService.getTodaySession(employee.id),
        resolveProfileImageUrl(employee.profile_image),
        getMonthlySalesSummary(employee.id),
      ]);

      setAttendance(attendanceResult);
      setWorkSession(workResult);
      setProfileImageUrl(profileImageResult);
      setMonthlySales(todaySalesResult);
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setDashboardLoading(false);
    }
  }, [employee]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );

  if (!employee) {
    return null;
  }

  if (dashboardLoading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const attendanceLabel = getAttendanceLabel(attendance);
  const workStatusLabel = getWorkStatus(workSession);
  const totalKm = workSession?.total_km ?? 0;
  const todayLong = dayjs().format("dddd, DD MMM YYYY");

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <View style={styles.headerGlowOne} />
          <View style={styles.headerGlowTwo} />

          <View style={styles.topBar}>
            <View style={styles.headerLogoOnly}>
              <View style={styles.logoCircle}>
                <Image
                  source={HEADER_IMAGE}
                  resizeMode="contain"
                  style={styles.logoImage}
                />
              </View>
            </View>

            <View style={styles.centerBrand}>
              <Text style={styles.topBarLabel}>VETRONIX</Text>
              <Text style={styles.topBarSubLabel}>BIOTECH PVT. LTD.</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.profileHeaderButton,
                pressed && styles.profileHeaderButtonPressed,
              ]}
              android_ripple={{ color: "rgba(255,255,255,0.18)", borderless: false }}
              onPress={() => navigation.navigate("EmployeeProfile" as never)}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <UserCircle color="#FFFFFF" size={16} strokeWidth={2.2} />
              <Text style={styles.portalBadgeText}>PROFILE</Text>
            </Pressable>
          </View>

          <View style={styles.welcomeContent}>
            <View style={styles.profileImageShell}>
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  resizeMode="cover"
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImageFallback}>
                  <UserCircle size={36} color={Colors.primary} strokeWidth={1.8} />
                </View>
              )}
            </View>

            <View style={styles.welcomeTextContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.employeeName} numberOfLines={1}>
                {employee.full_name ?? "Employee"}
              </Text>

              <View style={styles.dateRow}>
                <CalendarDays size={13} color="#E3F1FF" strokeWidth={2.2} />
                <Text style={styles.todayText}>{todayLong}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <Pressable
            style={styles.statCardPressable}
              onPress={() => navigation.navigate("AttendanceHistory")}
            android_ripple={{ color: "#EAF4FF", borderless: false }}
          >
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <View style={styles.statIconShell}>
                  <CalendarCheck color={Colors.primary} size={20} strokeWidth={2.2} />
                </View>

                <View
                  style={[
                    styles.attendanceStatusDot,
                    {
                      backgroundColor:
                        attendance?.status === "PRESENT"
                          ? "#16A34A"
                          : attendance?.status === "HALF_DAY"
                            ? "#EAB308"
                            : attendance?.status === "LEAVE" ||
                                attendance?.status === "ABSENT"
                              ? "#DC2626"
                              : "#94A3B8",
                    },
                  ]}
                />
              </View>

              <Text style={styles.statValue} numberOfLines={2}>
                {attendanceLabel}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                TODAY'S ATTENDANCE
              </Text>
            </View>
          </Pressable>

          <View style={styles.statCardPressable}>
            <StatisticCard label={"Today's KM"} value={`${totalKm} KM`} icon={Route} />
          </View>

          <View style={styles.statCardPressable}>
            <StatisticCard label={"Work Status"} value={workStatusLabel} icon={BriefcaseBusiness} />
          </View>

          <View style={styles.statCardPressable}>
            <StatisticCard
              label={"Monthly Sales / Target"}
              value={`₹${monthlySales.achieved.toLocaleString("en-IN")} / ₹${monthlySales.target.toLocaleString("en-IN")}`}
              icon={ShoppingCart}
            />
          </View>
        </View>

        <View style={styles.quickActionsHeader}>
          <View style={styles.sectionTitleWrap}>
            <View style={styles.sectionAccent} />
            <View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionSubtitle}>Select a module to continue</Text>
            </View>
          </View>

          <View style={styles.fieldModeBadge}>
            <View style={styles.fieldModeDot} />
            <Text style={styles.fieldModeText}>Field Mode</Text>
          </View>
        </View>

        <View style={styles.categoryList}>
          {MENU_CATEGORIES.map((category) => (
            <View key={category.title} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.menuGrid}>
                {category.items.map((item) => (
                  <MenuCard
                    key={item.route}
                    title={item.title}
                    icon={item.icon}
                    onPress={() => navigation.navigate(item.route)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.endWorkButton,
            pressed && styles.actionButtonPressed,
          ]}
          android_ripple={{ color: "#DCEEFF", borderless: false }}
          onPress={() => navigation.navigate("EndWork")}
        >
          <View style={styles.endWorkIconShell}>
            <BriefcaseBusiness color={Colors.primary} size={18} strokeWidth={2.2} />
          </View>
          <Text style={styles.endWorkText}>Complete Daily Tasks / End Work</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          android_ripple={{ color: "#FEE2E2", borderless: false }}
          onPress={handleLogout}
        >
          <LogOut color={Colors.danger} size={18} strokeWidth={2.2} />
          <Text style={styles.logoutText}>Logout from Portal</Text>
        </Pressable>

        <View style={styles.footerCard}>
          <View style={styles.footerRow}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>ASIA HQ</Text>
              <Text style={styles.footerSubHeading}>H-1701, VVIP Homes</Text>
              <Text style={styles.footerText}>
                Greater Noida, India{"\n"}
                UP-201304
              </Text>
            </View>

            <View style={styles.footerDivider} />

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>EUROPE OPS</Text>
              <Text style={styles.footerSubHeading}>4th Floor, Silverstream</Text>
              <Text style={styles.footerText}>
                House{"\n"}
                45 Fitzroy Street{"\n"}
                London W1T 6EB
              </Text>
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.footerRow}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>MENA REGION</Text>
              <Text style={styles.footerSubHeading}>CR No.1555374</Text>
              <Text style={styles.footerText}>
                South Al Mabilah{"\n"}
                Muscat, Oman
              </Text>
            </View>

            <View style={styles.footerDivider} />

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>CONNECTIVITY</Text>
              <Text style={styles.footerText}>
                www.vetronix.in{"\n"}
                info@vetronix.in{"\n"}
                +91 9044797575
              </Text>
            </View>
          </View>

          <View style={styles.copyrightBar}>
            <Text style={styles.copyrightText}>© 2026 VETRONIX BIOTECH PVT. LTD.</Text>
            <Text style={styles.copyrightSubText}>
              ALL RIGHTS RESERVED • PROFESSIONAL HEALTHCARE SYSTEMS
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function StatisticCard({ label, value, icon: Icon }: StatisticCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconShell}>
        <Icon color={Colors.primary} size={20} strokeWidth={2.2} />
      </View>
      <Text style={styles.statValue} numberOfLines={2}>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function MenuCard({ title, icon: Icon, onPress }: MenuCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  };

  return (
    <Pressable
      style={styles.menuPressable}
      android_ripple={{ color: "#EAF4FF", borderless: false }}
      onPress={onPress}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View style={[styles.menuCard, { transform: [{ scale }] }]}>
        <View style={styles.menuIconShell}>
          <Icon color={Colors.primary} size={21} strokeWidth={2.1} />
        </View>
        <Text style={styles.menuTitle} numberOfLines={2}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F8FC" },
  container: { flex: 1 },
  contentContainer: { paddingBottom: 34 },

  /* ---------- Header + welcome merged into one hero block ---------- */
  headerBlock: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 26,
    overflow: "hidden",
    shadowColor: "#00416E",
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 9,
  },
  headerGlowOne: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  headerGlowTwo: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  topBar: {
    minHeight: 60,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLogoOnly: {
    width: 90,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  centerBrand: {
    position: "absolute",
    left: 90,
    right: 90,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: { width: 31, height: 31 },
  topBarLabel: {
    fontSize: 16.5,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#FFFFFF",
  },
  topBarSubLabel: {
    marginTop: 2,
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#CFE8FF",
  },
  portalBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },
  portalBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: "#FFFFFF",
  },

  profileHeaderButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  profileHeaderButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },

  welcomeContent: {
    marginTop: 6,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageShell: {
    width: 74,
    height: 74,
    borderRadius: 37,
    padding: 3,
    backgroundColor: "#FFFFFF",
    shadowColor: "#00263F",
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 34 },
  profileImageFallback: {
    flex: 1,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4FF",
  },
  welcomeTextContainer: { flex: 1, marginLeft: 15 },
  greeting: {
    fontSize: 10,
    fontWeight: "800",
    color: "#BFDFFA",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  employeeName: {
    marginTop: 3,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
  dateRow: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  todayText: {
    marginLeft: 6,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#EAF5FF",
  },

  /* ---------- Stats ---------- */
  statsGrid: {
    paddingHorizontal: 16,
    marginTop: -14,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCardPressable: {
    width: "48.4%",
    marginBottom: 12,
    borderRadius: 18,
    overflow: "hidden",
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attendanceStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statCard: {
    width: "100%",
    minHeight: 112,
    padding: 14,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6EEF6",
    shadowColor: "#0E2E4C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  statIconShell: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5FF",
  },
  statValue: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.2,
    color: "#16324F",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
    color: "#8697A8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  /* ---------- Section header ---------- */
  quickActionsHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleWrap: { flexDirection: "row", alignItems: "center" },
  sectionAccent: {
    width: 4,
    height: 32,
    borderRadius: 3,
    marginRight: 10,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
    color: "#16324F",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B2",
  },
  fieldModeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ECF7FF",
    borderWidth: 1,
    borderColor: "#C6E5F8",
  },
  fieldModeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1597D4",
    marginRight: 6,
  },
  fieldModeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#0F76AE",
  },

  /* ---------- Categorized quick actions ---------- */
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryBlock: {
    marginBottom: 18,
  },
  categoryTitle: {
    marginBottom: 10,
    paddingHorizontal: 2,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: "#64748B",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuPressable: {
    width: "48.4%",
    marginBottom: 12,
    borderRadius: 18,
    overflow: "hidden",
  },
  menuCard: {
    minHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6EEF6",
    shadowColor: "#0E2E4C",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  menuIconShell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5FF",
    borderWidth: 1,
    borderColor: "#D8ECFB",
  },
  menuTitle: {
    marginTop: 9,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#1E3A57",
    textAlign: "center",
    textTransform: "uppercase",
  },

  /* ---------- Primary / danger actions ---------- */
  endWorkButton: {
    minHeight: 54,
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: "#9DD5F5",
    borderStyle: "dashed",
    backgroundColor: "#F4FBFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  endWorkIconShell: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2F2FE",
  },
  actionButtonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  endWorkText: {
    fontSize: 12.5,
    fontWeight: "900",
    letterSpacing: 0.2,
    color: Colors.primary,
  },

  logoutButton: {
    minHeight: 50,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F6CFCF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: "#8A1C1C",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  logoutButtonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  logoutText: {
    fontSize: 12.5,
    fontWeight: "900",
    letterSpacing: 0.2,
    color: Colors.danger,
  },

  /* ---------- Hard-coded native footer ---------- */
  footerCard: {
    marginHorizontal: 16,
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6EEF6",
    shadowColor: "#0E2E4C",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  footerTopBrand: {
    minHeight: 66,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  footerBrandMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D9EEFF",
  },

  footerBrandV: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "900",
  },

  footerBrandName: {
    color: Colors.primary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },

  footerBrandSubtitle: {
    marginTop: 1,
    color: "#71869A",
    fontSize: 7.5,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  footerDividerFull: {
    height: 1,
    backgroundColor: "#EBF1F6",
    marginHorizontal: 16,
  },

  footerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  footerColumn: {
    flex: 1,
  },

  footerHeading: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.primary,
    marginBottom: 5,
    letterSpacing: 0.7,
  },

  footerSubHeading: {
    fontSize: 9,
    fontWeight: "700",
    color: "#5D7285",
    marginBottom: 3,
  },

  footerText: {
    fontSize: 9,
    color: "#7D8D9C",
    lineHeight: 14,
  },

  footerDivider: {
    width: 1,
    backgroundColor: "#EBF1F6",
    marginHorizontal: 14,
  },

  horizontalDivider: {
    height: 1,
    backgroundColor: "#F0F4F8",
  },

  copyrightBar: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
  },

  copyrightText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  copyrightSubText: {
    marginTop: 4,
    color: "#CDE9FF",
    fontSize: 7.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F8FC",
  },
});