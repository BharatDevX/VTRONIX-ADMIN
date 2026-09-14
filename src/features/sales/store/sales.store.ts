import { create } from "zustand";
import type { Sale } from "../types/sales.types";

interface State {
  sales: Sale[];
  loading: boolean;
  saving: boolean;
  setSales: (sales: Sale[]) => void;
  upsertSale: (sale: Sale) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

function getSaleBusinessKey(sale: Sale): string {
  return [
    sale.employee_id,
    sale.sale_type,
    sale.dealer_id,
    sale.doctor_id ?? "null",
    sale.retailer_id ?? "null",
    sale.product_id,
    sale.sale_date,
  ].join("|");
}

export const useSalesStore = create<State>((set) => ({
  sales: [],
  loading: false,
  saving: false,
  setSales: (sales) => set({ sales }),
  upsertSale: (sale) =>
    set((state) => {
      const saleBusinessKey = getSaleBusinessKey(sale);
      const existingIndex = state.sales.findIndex(
        (item) => item.id === sale.id || getSaleBusinessKey(item) === saleBusinessKey
      );

      if (existingIndex === -1) {
        return { sales: [sale, ...state.sales] };
      }

      const nextSales = [...state.sales];
      nextSales[existingIndex] = sale;

      return { sales: nextSales };
    }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
}));
