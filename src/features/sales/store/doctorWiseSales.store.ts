import { create } from "zustand";
import type { DoctorWiseSaleReport } from "../types/doctorWiseSales.types";

interface State {

    reports: DoctorWiseSaleReport[];

    loading: boolean;

    setReports: (reports: DoctorWiseSaleReport[]) => void;

    setLoading: (loading: boolean) => void;

}

export const useDoctorWiseSalesStore = create<State>((set) => ({

    reports: [],

    loading: false,

    setReports: (reports) => set({ reports }),

    setLoading: (loading) => set({ loading })

}));