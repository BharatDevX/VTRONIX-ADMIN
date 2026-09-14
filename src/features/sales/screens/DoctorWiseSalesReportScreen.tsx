import React, { useEffect, useMemo, useRef } from "react";
import {
  ScrollView,
  RefreshControl,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
} from "react-native";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppCard from "../../../components/ui/AppCard";

import { useAuthStore } from "../../auth/store/auth.store";
import { useDoctorWiseSales } from "../hooks/useDoctorWiseSales";

export default function DoctorWiseSalesReportScreen() {

    const { employee } = useAuthStore();

    const {

        reports,

        loading,

        error,

        reload

    } = useDoctorWiseSales(employee?.id ?? "");

    const totalQty = useMemo(() => {

        return reports.reduce(

            (sum,item)=>sum+item.quantity,

            0

        );

    },[reports]);

    const totalAmount = useMemo(() => {

        return reports.reduce(

            (sum,item)=>sum+item.amount,

            0

        );

    },[reports]);

    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(16)).current;

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
    }, [reports.length]);

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

                title="Doctor Wise Sales"
                subtitle="Sales broken down by doctor"

            />

            <Animated.View
                style={{
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }],
                    gap: 14,
                }}
            >

                <View style={styles.statRow}>
                    <View style={styles.statBox}>
                        <View style={styles.statTopRow}>
                            <View style={[styles.statDot, { backgroundColor: "#EEF2FF" }]}>
                                <Text style={[styles.statGlyph, { color: "#4F6BED" }]}>#</Text>
                            </View>
                            <Text style={styles.statLabel}>Total Quantity</Text>
                        </View>
                        <Text style={styles.statValue}>{totalQty}</Text>
                        <View style={[styles.statUnderline, { backgroundColor: "#4F6BED" }]} />
                    </View>

                    <View style={styles.statBox}>
                        <View style={styles.statTopRow}>
                            <View style={[styles.statDot, { backgroundColor: "#E7F7F0" }]}>
                                <Text style={[styles.statGlyph, { color: "#1D9C6E" }]}>₹</Text>
                            </View>
                            <Text style={styles.statLabel}>Total Amount</Text>
                        </View>
                        <Text style={[styles.statValue, styles.statValueAccent]}>
                            ₹{totalAmount.toFixed(2)}
                        </Text>
                        <View style={[styles.statUnderline, { backgroundColor: "#1D9C6E" }]} />
                    </View>
                </View>

                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Doctors</Text>
                    <View style={styles.countPill}>
                        <Text style={styles.countPillText}>{reports.length}</Text>
                    </View>
                </View>

                {

                    error && (

                        <AppCard>

                            <View style={styles.errorRow}>

                                <View style={styles.errorBadge}>
                                    <Text style={styles.errorBadgeText}>!</Text>
                                </View>

                                <Text style={styles.errorText}>

                                    {error}

                                </Text>

                            </View>

                        </AppCard>

                    )

                }

                {

                    !error && reports.length===0 && (

                        <AppCard>

                            <View style={styles.emptyWrap}>

                                <View style={styles.emptyGlyphWrap}>
                                    <Text style={styles.emptyGlyph}>🩺</Text>
                                </View>

                                <Text style={styles.emptyTitle}>
                                    No Doctor Sales Found
                                </Text>

                                <Text style={styles.emptyText}>
                                    Pull down to refresh and check again.
                                </Text>

                            </View>

                        </AppCard>

                    )

                }

                {

                    reports.map((item)=>(

                        <AppCard key={item.id}>

                            <View style={styles.cardAccent} />

                            <View style={styles.cardHead}>

                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {(item.doctor_name ?? "?").trim().charAt(0).toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.cardHeadText}>

                                    <Text style={styles.title} numberOfLines={1}>

                                        {item.doctor_name}

                                    </Text>

                                    <Text style={styles.subTitle} numberOfLines={1}>
                                        {item.dealer_name}
                                    </Text>

                                </View>

                                <View style={styles.amountPill}>
                                    <Text style={styles.amountPillText}>₹{item.amount}</Text>
                                </View>

                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Dealer</Text>
                                <Text style={styles.value} numberOfLines={1}>{item.dealer_name}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Retailer</Text>
                                <Text style={styles.value} numberOfLines={1}>{item.retailer_name || "-"}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Medicine</Text>
                                <Text style={styles.value} numberOfLines={1}>{item.product_name}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Quantity</Text>
                                <View style={styles.chip}>
                                    <Text style={styles.chipText}>{item.quantity}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Rate</Text>
                                <Text style={styles.value}>₹{item.rate}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Amount</Text>
                                <Text style={[styles.value, styles.amountValue]}>₹{item.amount}</Text>
                            </View>

                            <View style={styles.infoRowLast}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={styles.dateText}>{item.sale_date}</Text>
                            </View>

                        </AppCard>

                    ))

                }

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

    statRow: {
        flexDirection: "row",
        gap: 12,
    },

    statBox: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EEF1F6",
        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
    },

    statTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },

    statDot: {
        width: 26,
        height: 26,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },

    statGlyph: {
        fontSize: 13,
        fontWeight: "800",
    },

    statLabel: {
        fontSize: 11.5,
        color: "#8A8F98",
        fontWeight: "600",
        letterSpacing: 0.3,
        textTransform: "uppercase",
        flexShrink: 1,
    },

    statValue: {
        fontSize: 21,
        fontWeight: "800",
        color: "#101418",
        letterSpacing: -0.4,
    },

    statValueAccent: {
        color: "#1D9C6E",
    },

    statUnderline: {
        height: 3,
        width: 28,
        borderRadius: 3,
        marginTop: 10,
        opacity: 0.85,
    },

    sectionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 2,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6B7280",
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },

    countPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: "#EEF1F6",
    },

    countPillText: {
        fontSize: 11.5,
        fontWeight: "700",
        color: "#6B7280",
    },

    errorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    errorBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
    },

    errorBadgeText: {
        color: "#DC2626",
        fontWeight: "800",
        fontSize: 13,
    },

    errorText: {
        flex: 1,
        color: "#DC2626",
        fontWeight: "600",
        fontSize: 13.5,
    },

    emptyWrap: {
        alignItems: "center",
        paddingVertical: 14,
        gap: 6,
    },

    emptyGlyphWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#F1F4F9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },

    emptyGlyph: {
        fontSize: 22,
    },

    emptyTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#101418",
    },

    emptyText: {
        color: "#8A8F98",
        fontSize: 13,
        textAlign: "center",
    },

    cardAccent: {
        position: "absolute",
        left: 0,
        top: 14,
        bottom: 14,
        width: 3,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
        backgroundColor: "#4F6BED",
        opacity: 0.85,
    },

    cardHead: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },

    avatar: {
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },

    avatarText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#4F6BED",
    },

    cardHeadText: {
        flex: 1,
    },

    title:{

        fontSize:15.5,

        fontWeight:"800",

        color: "#101418",

        letterSpacing: -0.2,

    },

    subTitle: {
        fontSize: 12.5,
        color: "#8A8F98",
        marginTop: 2,
    },

    amountPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#E7F7F0",
    },

    amountPillText: {
        fontSize: 12.5,
        fontWeight: "800",
        color: "#1D9C6E",
    },

    divider: {
        height: 1,
        backgroundColor: "#EEF1F6",
        marginBottom: 2,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F4F6FA",
        gap: 12,
    },

    infoRowLast: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        gap: 12,
    },

    label: {
        fontSize: 13,
        color: "#8A8F98",
        fontWeight: "500",
    },

    value: {
        fontSize: 14,
        fontWeight: "700",
        color: "#101418",
        flexShrink: 1,
        textAlign: "right",
    },

    chip: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: "#F1F4F9",
    },

    chipText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#3C4350",
    },

    amountValue: {
        color: "#1D9C6E",
    },

    dateText: {
        fontSize: 12.5,
        fontWeight: "600",
        color: "#6B7280",
    },

});
