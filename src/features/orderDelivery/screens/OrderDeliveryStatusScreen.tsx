import React, { useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { ChevronRight, FileText, PackageCheck, Truck } from "lucide-react-native";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import AppCard from "../../../components/ui/AppCard";
import { useAuthStore } from "../../auth/store/auth.store";
import { useOrderDeliveries } from "../hooks/useOrderDeliveries";
import { openOrderInvoice } from "../services/orderDelivery.service";
import type { EmployeeOrderDelivery } from "../types/orderDelivery.types";

const money = (value: number) => `₹${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function OrderCard({ item, onOpen }: { item: EmployeeOrderDelivery; onOpen: () => void }) {
  const progress = item.sale.amount > 0 ? Math.min(100, (item.deliveredAmount / item.sale.amount) * 100) : 0;
  const status = item.deliveredAmount <= 0 ? "Pending" : item.remainingAmount <= 0 ? "Fully Delivered" : "Partially Delivered";

  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}><PackageCheck size={21} color="#0877B9" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.product}>{item.sale.product_name || "Order"}</Text>
          <Text style={styles.meta}>{item.sale.sale_date} • {item.sale.sale_type}</Text>
        </View>
        <ChevronRight size={20} color="#9AA8B5" />
      </View>

      <View style={styles.amountRow}>
        <View><Text style={styles.label}>Order Value</Text><Text style={styles.amount}>{money(item.sale.amount)}</Text></View>
        <View style={styles.rightAmount}><Text style={styles.label}>Remaining</Text><Text style={styles.remaining}>{money(item.remainingAmount)}</Text></View>
      </View>

      <View style={styles.progressTrack}><View style={[styles.progress, { width: `${progress}%` }]} /></View>
      <View style={styles.bottomRow}>
        <Text style={styles.delivered}>Delivered {money(item.deliveredAmount)}</Text>
        <View style={[styles.statusPill, item.remainingAmount <= 0 ? styles.successPill : item.deliveredAmount > 0 ? styles.partialPill : styles.pendingPill]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Details({ item, onClose }: { item: EmployeeOrderDelivery; onClose: () => void }) {
  return (
    <View style={styles.detailOverlay}>
      <View style={styles.detailPanel}>
        <View style={styles.detailHeader}>
          <View><Text style={styles.detailTitle}>Order Delivery</Text><Text style={styles.meta}>Original order {money(item.sale.amount)}</Text></View>
          <Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summaryBox}>
            <Text style={styles.label}>Delivered</Text><Text style={styles.big}>{money(item.deliveredAmount)}</Text>
            <Text style={styles.label}>Remaining</Text><Text style={styles.big}>{money(item.remainingAmount)}</Text>
          </View>

          <Text style={styles.sectionTitle}>Delivery History</Text>
          {item.deliveries.map((delivery) => {
            const invoice = item.invoices.find((candidate) => candidate.delivery_id === delivery.id);
            return (
              <AppCard key={delivery.id}>
                <View style={styles.deliveryHeader}>
                  <View style={styles.iconWrap}><Truck size={18} color="#0877B9" /></View>
                  <View style={{ flex: 1 }}><Text style={styles.deliveryAmount}>{money(delivery.delivered_amount)}</Text><Text style={styles.meta}>Delivered {delivery.delivery_date}</Text></View>
                </View>
                {delivery.expected_delivery_date ? <Text style={styles.meta}>Next expected: {delivery.expected_delivery_date}</Text> : null}
                {delivery.remarks ? <Text style={styles.remark}>{delivery.remarks}</Text> : null}
                {invoice ? (
                  <Pressable style={styles.invoiceButton} onPress={() => openOrderInvoice(invoice.file_path).catch((e) => Alert.alert("Invoice", e instanceof Error ? e.message : "Unable to open invoice."))}>
                    <FileText size={17} color="#0877B9" /><Text style={styles.invoiceText}>View Invoice{invoice.invoice_number ? ` #${invoice.invoice_number}` : ""}</Text>
                  </Pressable>
                ) : <Text style={styles.pendingInvoice}>Invoice not uploaded yet.</Text>}
              </AppCard>
            );
          })}
          {item.deliveries.length === 0 ? <Text style={styles.empty}>No delivery has been recorded by admin yet.</Text> : null}
        </ScrollView>
      </View>
    </View>
  );
}

export default function OrderDeliveryStatusScreen() {
  const { employee } = useAuthStore();
  const { orders, loading, error, reload } = useOrderDeliveries(employee?.id ?? "");
  const [selected, setSelected] = useState<EmployeeOrderDelivery | null>(null);

  const totalOrdered = useMemo(() => orders.reduce((sum, order) => sum + order.sale.amount, 0), [orders]);
  const totalRemaining = useMemo(() => orders.reduce((sum, order) => sum + order.remainingAmount, 0), [orders]);

  return (
    <View style={styles.screen}>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Order Delivery Status" subtitle="Track deliveries and invoices for your orders" />
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.label}>My Orders</Text><Text style={styles.statValue}>{orders.length}</Text></View>
          <View style={styles.stat}><Text style={styles.label}>Remaining</Text><Text style={styles.statValue}>{money(totalRemaining)}</Text></View>
        </View>
        {loading && !orders.length ? <ActivityIndicator color="#0877B9" style={{ marginTop: 30 }} /> : null}
        {error ? <AppCard><Text style={styles.error}>{error}</Text></AppCard> : null}
        {!loading && !orders.length && !error ? <AppCard><Text style={styles.empty}>No orders found.</Text></AppCard> : null}
        {orders.map((item) => <OrderCard key={item.sale.id} item={item} onOpen={() => setSelected(item)} />)}
        <Text style={styles.footerNote}>Total order value: {money(totalOrdered)}</Text>
      </ScrollView>
      {selected ? <Details item={selected} onClose={() => setSelected(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F8FC" },
  container: { padding: 20, paddingBottom: 44, gap: 14 },
  statsRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E4ECF2" },
  label: { fontSize: 12, color: "#7C8A97", fontWeight: "600" },
  statValue: { marginTop: 5, fontSize: 18, color: "#16324F", fontWeight: "800" },
  orderCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E1EAF1", shadowColor: "#0B4F71", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  pressed: { opacity: 0.92 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EAF6FD", justifyContent: "center", alignItems: "center" },
  product: { color: "#16324F", fontSize: 16, fontWeight: "800" },
  meta: { marginTop: 3, color: "#8795A3", fontSize: 12 },
  amountRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  rightAmount: { alignItems: "flex-end" },
  amount: { marginTop: 4, color: "#16324F", fontSize: 20, fontWeight: "900" },
  remaining: { marginTop: 4, color: "#0877B9", fontSize: 16, fontWeight: "800" },
  progressTrack: { marginTop: 14, height: 7, borderRadius: 99, backgroundColor: "#E9EFF4", overflow: "hidden" },
  progress: { height: "100%", borderRadius: 99, backgroundColor: "#0F8AC7" },
  bottomRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  delivered: { color: "#667786", fontSize: 12, fontWeight: "600" },
  statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  successPill: { backgroundColor: "#E9F8F0" },
  partialPill: { backgroundColor: "#FFF5DB" },
  pendingPill: { backgroundColor: "#EDF3F7" },
  statusText: { color: "#376075", fontSize: 11, fontWeight: "800" },
  error: { color: "#C62828", fontWeight: "600" },
  empty: { color: "#8896A3", textAlign: "center", paddingVertical: 12 },
  footerNote: { textAlign: "center", color: "#96A4AF", fontSize: 12, marginTop: 4 },
  detailOverlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(6,28,45,0.38)", justifyContent: "flex-end" },
  detailPanel: { maxHeight: "88%", backgroundColor: "#F4F8FC", borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, gap: 14 },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailTitle: { color: "#16324F", fontSize: 20, fontWeight: "900" },
  close: { color: "#0877B9", fontWeight: "800" },
  summaryBox: { backgroundColor: "#0877B9", borderRadius: 18, padding: 18 },
  big: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 3, marginBottom: 10 },
  sectionTitle: { color: "#16324F", fontSize: 16, fontWeight: "900", marginTop: 4 },
  deliveryHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  deliveryAmount: { color: "#16324F", fontSize: 17, fontWeight: "900" },
  remark: { color: "#647586", fontSize: 13, marginTop: 8 },
  invoiceButton: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 10 },
  invoiceText: { color: "#0877B9", fontWeight: "800", fontSize: 13 },
  pendingInvoice: { marginTop: 10, color: "#9A7A2D", fontSize: 12, fontWeight: "600" },
});
