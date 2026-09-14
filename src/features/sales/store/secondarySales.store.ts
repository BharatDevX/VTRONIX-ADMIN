import { create } from "zustand";
import type { SecondarySale } from "../types/secondarySales.types";

interface State {

    reports: SecondarySale[];

    loading: boolean;

    setReports: (reports: SecondarySale[]) => void;

    setLoading: (loading: boolean) => void;

}

export const useSecondarySalesStore = create<State>((set)=>({

    reports: [],

    loading: false,

    setReports:(reports)=>set({reports}),

    setLoading:(loading)=>set({loading})

}));