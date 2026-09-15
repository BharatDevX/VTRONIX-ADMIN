import { create } from "zustand";

import type { DoctorVisit } from "../types/doctoVisit.types";

interface State {
  visits: DoctorVisit[];
  loading: boolean;
  saving: boolean;
  setVisits: (visits: DoctorVisit[]) => void;
  upsertVisit: (visit: DoctorVisit) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

export const useDoctorVisitStore = create<State>((set) => ({
  visits: [],
  loading: false,
  saving: false,
  setVisits: (visits) => set({ visits }),
  upsertVisit: (visit) =>
    set((state) => {
      const index = state.visits.findIndex((item) => item.id === visit.id);

      if (index >= 0) {
        const next = [...state.visits];
        next[index] = visit;
        return { visits: next };
      }

      return { visits: [...state.visits, visit] };
    }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
}));