import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import ReportSummaryCard from "../../../components/report/ReportSummaryCard";
import { useAuthStore } from "../../auth/store/auth.store";
import { useIncentive } from "../hooks/useIncentive";

export default function IncentiveDashboardScreen() {

    const { employee } = useAuthStore();

    const {

        dashboard,

        loading,

        error,

        reload

    } = useIncentive(employee?.id ?? "");

    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(16)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

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
    }, []);

    useEffect(() => {
        if (!dashboard) return;

        Animated.timing(progressWidth, {
            toValue: Math.min(dashboard.achievement, 100),
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [dashboard?.achievement]);

    if(!dashboard){

        return null;

    }

    const remaining=Math.max(

        dashboard.target-dashboard.achieved,

        0

    );

    return(

        <ScrollView

            style={styles.screen}

            contentContainerStyle={styles.container}

            showsVerticalScrollIndicator={false}

            refreshControl={

                <RefreshControl

                    refreshing={loading}

                    onRefresh={reload}

                    tintColor="#1D9C6E"

                    colors={["#1D9C6E"]}

                />

            }

        >

            <ScreenHeader

                title="Incentive Dashboard"
                subtitle="Track your target and earnings"

            />

            <Animated.View
                style={{
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }],
                    gap: 14,
                }}
            >

                {

                    error && (

                        <ReportSummaryCard

                            title="Error"

                            value={error}

                        />

                    )

                }

                <View style={styles.heroCard}>

                    <View style={styles.heroGlow} />

                    <Text style={styles.heroLabel}>Incentive Earned</Text>

                    <Text style={styles.heroValue}>
                        ₹{dashboard.incentive.toFixed(2)}
                    </Text>

                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>
                            {dashboard.achievement.toFixed(1)}% of target achieved
                        </Text>
                    </View>

                </View>

                <View style={styles.row}>

                    <View style={styles.rowItem}>
                        <ReportSummaryCard

                            title="Target"

                            value={`₹${dashboard.target}`}

                        />
                    </View>

                    <View style={styles.rowItem}>
                        <ReportSummaryCard

                            title="Achieved"

                            value={`₹${dashboard.achieved}`}

                        />
                    </View>

                </View>

                <View style={styles.row}>

                    <View style={styles.rowItem}>
                        <ReportSummaryCard

                            title="Achievement"

                            value={`${dashboard.achievement.toFixed(1)} %`}

                        />
                    </View>

                    <View style={styles.rowItem}>
                        <ReportSummaryCard

                            title="Incentive"

                            value={`₹${dashboard.incentive.toFixed(2)}`}

                        />
                    </View>

                </View>

                <View style={styles.progressContainer}>

                    <View style={styles.progressHeaderRow}>
                        <View>
                            <Text style={styles.heading}>

                                Target Progress

                            </Text>

                            <Text style={styles.subHeading}>
                                Keep going to unlock more incentive
                            </Text>
                        </View>

                        <View style={styles.percentPill}>
                            <Text style={styles.progressPercent}>
                                {Math.min(dashboard.achievement, 100).toFixed(1)}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.progressBackground}>

                        <Animated.View

                            style={[

                                styles.progressFill,

                                {

                                    width: progressWidth.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ["0%", "100%"],
                                    }),

                                }

                            ]}

                        >

                            <View style={styles.progressShine} />

                        </Animated.View>

                    </View>

                    <View style={styles.scaleRow}>
                        <Text style={styles.scaleText}>0%</Text>
                        <Text style={styles.scaleText}>50%</Text>
                        <Text style={styles.scaleText}>100%</Text>
                    </View>

                    <View style={styles.progressDivider} />

                    <View style={styles.remainingRow}>
                        <Text style={styles.remainingLabel}>

                            Remaining Target

                        </Text>

                        <Text style={styles.remainingValue}>

                            ₹{remaining}

                        </Text>
                    </View>

                </View>

            </Animated.View>

        </ScrollView>

    );

}

const styles=StyleSheet.create({

    screen: {
        backgroundColor: "#F5F7FA",
    },

    container:{

        padding:20,
        paddingBottom:44,
        gap:14

    },

    heroCard: {
        backgroundColor: "#101A16",
        borderRadius: 22,
        padding: 22,
        overflow: "hidden",
        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 4,
    },

    heroGlow: {
        position: "absolute",
        top: -60,
        right: -40,
        width: 170,
        height: 170,
        borderRadius: 90,
        backgroundColor: "#1D9C6E",
        opacity: 0.28,
    },

    heroLabel: {
        fontSize: 11.5,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "#8FD9BE",
    },

    heroValue: {
        marginTop: 8,
        fontSize: 34,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -1,
    },

    heroBadge: {
        alignSelf: "flex-start",
        marginTop: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.12)",
    },

    heroBadgeText: {
        fontSize: 12.5,
        fontWeight: "700",
        color: "#E8FFF5",
    },

    row:{

        flexDirection:"row",
        gap:12

    },

    rowItem: {
        flex: 1,
    },

    progressContainer:{

        marginTop:2,

        padding:20,

        backgroundColor:"#fff",

        borderRadius:20,

        borderWidth: 1,
        borderColor: "#EEF1F6",

        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation:2

    },

    progressHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom:16,
        gap: 12,

    },

    heading:{

        fontSize:16,

        fontWeight:"800",

        color: "#101418",

        letterSpacing: -0.3,

    },

    subHeading: {
        marginTop: 3,
        fontSize: 12.5,
        color: "#8A8F98",
    },

    percentPill: {
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#E7F7F0",
    },

    progressPercent: {
        fontSize: 14,
        fontWeight: "800",
        color: "#1D9C6E",
    },

    progressBackground:{

        height:14,

        backgroundColor:"#F1F4F9",

        borderRadius:10,

        overflow:"hidden",

        marginBottom:8

    },

    progressFill:{

        height:14,

        backgroundColor:"#1D9C6E",
        borderRadius:10,
        overflow: "hidden",

    },

    progressShine: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: "rgba(255,255,255,0.28)",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },

    scaleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    scaleText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#A6ADB8",
    },

    progressDivider: {
        height: 1,
        backgroundColor: "#EEF1F6",
        marginBottom: 14,
    },

    remainingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    remainingLabel: {
        fontSize: 13.5,
        color: "#8A8F98",
        fontWeight: "500",
    },

    remainingValue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#101418",
    }

});
