import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  RefreshControl,
  Text,
  View,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

import dayjs from "dayjs";

import ScreenHeader from "../../../components/ui/ScreenHeader";

import ReportSummaryCard from "../../../components/report/ReportSummaryCard";
import ReportListCard from "../../../components/report/ReportListCard";
import ReportEmptyState from "../../../components/report/ReportEmptyState";
import ReportSearchBar from "../../../components/report/ReportSearchBar";
import ReportDateFilter from "../../../components/report/ReportDateFilter";

import { useAuthStore } from "../../auth/store/auth.store";
import { useSecondarySales } from "../hooks/useSecondarySales";

export default function SecondarySalesReportScreen() {

    const { employee } = useAuthStore();

    const [search,setSearch]=useState("");

    const [date,setDate]=useState(

        dayjs().format("YYYY-MM-DD")

    );

    const {

        reports,

        loading,

        error,

        reload

    } = useSecondarySales(employee?.id ?? "", date);

    const filteredReports=useMemo(()=>{

        return reports.filter(item=>

            item.dealer_name

            .toLowerCase()

            .includes(search.toLowerCase())

        );

    },[reports,search]);

    const totalQty=useMemo(()=>{

        return filteredReports.reduce(

            (sum,item)=>

            sum+Number(item.total_quantity),

            0

        );

    },[filteredReports]);

    const totalAmount=useMemo(()=>{

        return filteredReports.reduce(

            (sum,item)=>

            sum+Number(item.total_amount),

            0

        );

    },[filteredReports]);

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
    }, [filteredReports.length]);

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

                title="Secondary Sales"
                subtitle="Search and filter dealer sales"

            />

            <Animated.View
                style={{
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }],
                    gap: 14,
                }}
            >

                <View style={styles.filterCard}>

                    <Text style={styles.filterTitle}>Filters</Text>

                    <ReportSearchBar

                        value={search}

                        onChangeText={setSearch}

                    />

                    <View style={{ marginTop: 12 }}>
                        <ReportDateFilter

                            value={date}

                            onChange={setDate}

                        />
                    </View>

                    <View style={styles.filterFooter}>
                        <View style={styles.datePill}>
                            <Text style={styles.datePillText}>
                                {dayjs(date).format("DD MMM YYYY")}
                            </Text>
                        </View>

                        <Text style={styles.filterCount}>
                            {filteredReports.length} result
                            {filteredReports.length === 1 ? "" : "s"}
                        </Text>
                    </View>

                </View>

                <View style={styles.row}>
                    <View style={styles.rowItem}>
                        <ReportSummaryCard

                            title="Total Quantity"

                            value={totalQty}

                        />
                    </View>

                    <View style={styles.rowItem}>
                        <ReportSummaryCard

                            title="Total Sales"

                            value={`₹${totalAmount.toFixed(2)}`}

                        />
                    </View>
                </View>

                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Dealers</Text>
                    <View style={styles.countPill}>
                        <Text style={styles.countPillText}>{filteredReports.length}</Text>
                    </View>
                </View>

                {

                    error &&
                    <ReportEmptyState

                        message={error}

                    />

                }

                {

                    !error && filteredReports.length===0 &&
                    <ReportEmptyState

                        message="No Sales Found"

                    />

                }

                {

                    filteredReports.map((item,index)=>(

                        <ReportListCard

                            key={index}

                            title={item.dealer_name}

                        >

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Product</Text>
                                <Text style={styles.value} numberOfLines={1}>{item.product_name}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Quantity</Text>
                                <View style={styles.chip}>
                                    <Text style={styles.chipText}>{item.total_quantity}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRowLast}>
                                <Text style={styles.label}>Amount</Text>
                                <View style={styles.amountPill}>
                                    <Text style={styles.amountPillText}>₹{item.total_amount}</Text>
                                </View>
                            </View>

                        </ReportListCard>

                    ))

                }

            </Animated.View>

        </ScrollView>

    );

}

const styles = StyleSheet.create({

    screen: {
        backgroundColor: "#F5F7FA",
    },

    container: {
        padding: 20,
        paddingBottom: 44,
        gap: 14,
    },

    filterCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EEF1F6",
        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
    },

    filterTitle: {
        fontSize: 11.5,
        fontWeight: "700",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: "#8A8F98",
        marginBottom: 12,
    },

    filterFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F4F9",
    },

    datePill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#EEF2FF",
    },

    datePillText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#4F6BED",
    },

    filterCount: {
        fontSize: 12.5,
        fontWeight: "600",
        color: "#8A8F98",
    },

    row: {
        flexDirection: "row",
        gap: 12,
    },

    rowItem: {
        flex: 1,
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

    amountPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#E7F7F0",
    },

    amountPillText: {
        fontSize: 13,
        fontWeight: "800",
        color: "#1D9C6E",
    },
});
