import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Alert, View, Text, Animated, Easing } from "react-native";
import dayjs from "dayjs";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppInput from "../../../components/ui/AppInput";
import AppSearchDropdown from "../../../components/ui/AppSearchDropdown";
import AppMultiSelect from "../../../components/ui/AppMultiSelect";
import AppRadioGroup from "../../../components/ui/AppRadioGroup";
import AppDatePicker from "../../../components/ui/AppDatePicker";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import AppCard from "../../../components/ui/AppCard";

import { useMasters } from "../../master/hooks/useMasters";
import { useSales } from "../hooks/useSales";
import { useAuthStore } from "../../auth/store/auth.store";
import { SaleForm, SaleType } from "../types/sales.types";

function createInitialForm(saleDate: string): SaleForm {
  return {
    sale_type: "dealer",
    retailer_id: "",
    dealer_id: "",
    product_ids: [],
    sale_date: saleDate,
    quantity: 1,
    rate: 0,
  };
}

function parseNumber(value: string): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export default function SalesEntryScreen() {
  const { employee } = useAuthStore();
  const { dealers, retailers, products } = useMasters();
  const { save, saving } = useSales(employee?.id ?? "");

  const [form, setForm] = useState<SaleForm>(() => createInitialForm(dayjs().format("YYYY-MM-DD")));

  const amount = useMemo(() => Number(form.quantity || 0) * Number(form.rate || 0), [form.quantity, form.rate]);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  function updateForm(patch: Partial<SaleForm>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function resetForm() {
    setForm(createInitialForm(dayjs().format("YYYY-MM-DD")));
  }

  function validateForm(): string | null {
    if (!form.dealer_id?.trim()) return "Please select a dealer.";
    if (!form.product_ids?.length) return "Please select at least one medicine.";
    if (form.sale_type === "retailer" && !form.retailer_id?.trim()) return "Please select a retailer for retailer sales.";
    if (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) <= 0) return "Quantity must be greater than 0.";
    if (!Number.isFinite(Number(form.rate)) || Number(form.rate) <= 0) return "Rate must be greater than 0.";
    return null;
  }

  async function saveSale() {
    const validationMessage = validateForm();
    if (validationMessage) {
      Alert.alert("Validation", validationMessage);
      return;
    }

    try {
      const result = await save(form);
      Alert.alert("Success", result?.isUpdate ? "Existing order form updated successfully." : "Order form saved successfully.");
      resetForm();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save order form.");
       console.error("ORDER FORM SUPABASE ERROR:", {
       error
  });
    }
  }

  const saleTypeLabels: Record<SaleType, string> = {
    dealer: "Dealer Sale",
    retailer: "Retailer Sale",
    farmer: "Farmer Sale",
  };
  const activeSaleTypeLabel = saleTypeLabels[form.sale_type];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Order Form" subtitle="Record a new order" />

      <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }], gap: 18 }}>
        <View style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>ORDER SUMMARY</Text></View>
            <View style={styles.heroPill}><View style={styles.heroPillDot} /><Text style={styles.heroPillText}>{activeSaleTypeLabel}</Text></View>
          </View>
          <Text style={styles.heroAmountLabel}>Total Amount</Text>
          <Text style={styles.heroAmount}>₹{amount.toFixed(2)}</Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaTile}><Text style={styles.heroMetaLabel}>QTY</Text><Text style={styles.heroMetaValue}>{String(form.quantity || 0)}</Text></View>
            <View style={styles.heroMetaTile}><Text style={styles.heroMetaLabel}>RATE</Text><Text style={styles.heroMetaValue}>₹{Number(form.rate || 0).toFixed(2)}</Text></View>
            <View style={styles.heroMetaTile}><Text style={styles.heroMetaLabel}>MEDICINES</Text><Text style={styles.heroMetaValue}>{form.product_ids.length}</Text></View>
          </View>
        </View>

        <AppCard>
          <View style={styles.sectionHeadRow}><View style={styles.accentBar} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Sale Type</Text><Text style={styles.cardSubtitle}>Choose how this order is booked</Text></View></View>
          <View style={{ marginTop: 14 }}>
            <AppRadioGroup
              options={[
                { label: "Dealer Sale", value: "dealer" },
                { label: "Retailer Sale", value: "retailer" },
                { label: "Farmer Sale", value: "farmer" },
              ]}
              value={form.sale_type}
              onChange={(value) => updateForm({ sale_type: value as SaleType, retailer_id: "" })}
            />
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.sectionHeadRow}><View style={styles.accentBar} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Sale Details</Text><Text style={styles.cardSubtitle}>Party, medicines and order date</Text></View></View>
          <View style={styles.fieldGroup}>
            {form.sale_type === "retailer" && (
              <AppSearchDropdown label="Retailer" data={retailers} labelField="retailer_name" valueField="id" value={form.retailer_id} onChange={(item) => updateForm({ retailer_id: item.id })} />
            )}

            <AppSearchDropdown label="Dealer" data={dealers} labelField="dealer_name" valueField="id" value={form.dealer_id} onChange={(item) => updateForm({ dealer_id: item.id })} />

            <AppMultiSelect
              label="Medicine"
              data={products}
              labelField="product_name"
              valueField="id"
              value={form.product_ids}
              onChange={(items) => updateForm({ product_ids: items })}
            />

            <AppDatePicker label="Sale Date" value={form.sale_date} onChange={(date) => updateForm({ sale_date: date })} />
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.sectionHeadRow}><View style={styles.accentBar} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Pricing</Text><Text style={styles.cardSubtitle}>Amount is calculated automatically</Text></View></View>
          <View style={styles.fieldGroup}>
            <AppInput label="Quantity" value={String(form.quantity)} onChangeText={(text) => updateForm({ quantity: parseNumber(text) })} keyboardType="numeric" placeholder="" />
            <AppInput label="Rate" value={String(form.rate)} onChangeText={(text) => updateForm({ rate: parseNumber(text) })} keyboardType="numeric" placeholder="" />
            <AppInput label="Amount" editable={false} value={String(amount.toFixed(2))} placeholder="" onChangeText={() => undefined} />
          </View>
          <View style={styles.totalStrip}><Text style={styles.totalStripLabel}>Payable Amount</Text><Text style={styles.totalStripValue}>₹{amount.toFixed(2)}</Text></View>
        </AppCard>

        <View style={styles.submitWrap}>
          <PrimaryButton title="Save Order Form" onPress={saveSale} loading={saving} disabled={saving} />
          <Text style={styles.helperNote}>Review the party, medicines and pricing details before saving.</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F8FC" },
  container: { padding: 20, paddingBottom: 44, gap: 18 },
  hero: { borderRadius: 26, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18, backgroundColor: "#0F76AE", overflow: "hidden", shadowColor: "#00416E", shadowOpacity: 0.26, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 8 },
  heroGlowOne: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -90, right: -60, backgroundColor: "rgba(255,255,255,0.13)" },
  heroGlowTwo: { position: "absolute", width: 190, height: 190, borderRadius: 95, bottom: -110, left: -70, backgroundColor: "rgba(255,255,255,0.08)" },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroBadge: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)" },
  heroBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 1, color: "#FFFFFF" },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.24)" },
  heroPillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#7FE3B8" },
  heroPillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  heroAmountLabel: { marginTop: 18, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, color: "#BFDFFA" },
  heroAmount: { marginTop: 3, fontSize: 34, fontWeight: "800", letterSpacing: 0.4, color: "#FFFFFF" },
  heroMetaRow: { marginTop: 18, flexDirection: "row", gap: 10 },
  heroMetaTile: { flex: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.20)" },
  heroMetaLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, color: "#BFDFFA" },
  heroMetaValue: { marginTop: 4, fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  sectionHeadRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  accentBar: { width: 4, height: 30, borderRadius: 3, backgroundColor: "#1597D4" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#16324F" },
  cardSubtitle: { fontSize: 12.5, fontWeight: "500", color: "#8697A8", marginTop: 3 },
  fieldGroup: { gap: 12, marginTop: 14 },
  totalStrip: { marginTop: 16, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: "#EDF6FC", borderWidth: 1, borderColor: "#D6EAF7", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalStripLabel: { fontSize: 13, fontWeight: "700", color: "#4C6379" },
  totalStripValue: { fontSize: 18, fontWeight: "800", color: "#0F76AE" },
  submitWrap: { marginTop: 2 },
  helperNote: { marginTop: 8, textAlign: "center", fontSize: 11.5, color: "#8A9AAC" },
});
