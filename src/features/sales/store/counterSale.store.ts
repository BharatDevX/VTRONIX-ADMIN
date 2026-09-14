import { create } from "zustand";
import type { CounterSaleReport } from "../types/counterSale.types";

interface State {

    reports: CounterSaleReport[];

    loading: boolean;

    setReports: (reports: CounterSaleReport[]) => void;

    setLoading: (loading: boolean) => void;
}

export const useCounterSaleStore = create<State>((set) => ({

    reports: [],

    loading: false,

    setReports: (reports) => set({ reports }),

    setLoading: (loading) => set({ loading })

}));