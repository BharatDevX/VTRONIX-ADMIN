import { create } from "zustand";

import {
    DailyProgress,
    DailyProgressEntry,
} from "../types/dailyProgress.types";

interface DailyProgressState {

    progress: DailyProgress | null;

    entries: DailyProgressEntry[];

    loading: boolean;

    setProgress: (progress: DailyProgress | null) => void;

    setEntries: (entries: DailyProgressEntry[]) => void;

    addEntry: (entry: DailyProgressEntry) => void;

    removeEntry: (id: string) => void;

    setLoading: (loading: boolean) => void;
}

export const useDailyProgressStore =
create<DailyProgressState>((set) => ({

    progress: null,

    entries: [],

    loading: false,

    setProgress: (progress) =>
        set({ progress }),

    setEntries: (entries) =>
        set({ entries }),

    addEntry: (entry) =>
        set((state) => ({
            entries: [...state.entries, entry],
        })),

    removeEntry: (id) =>
        set((state) => ({
            entries: state.entries.filter(
                (item) => item.id !== id
            ),
        })),

    setLoading: (loading) =>
        set({ loading }),

}));