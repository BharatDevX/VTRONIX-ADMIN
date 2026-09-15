import { create } from "zustand";

import type { DoctorMeetingPlan } from "../types/doctorPlan.types";

interface State {
  plans: DoctorMeetingPlan[];
  loading: boolean;
  saving: boolean;
  setPlans: (plans: DoctorMeetingPlan[]) => void;
  upsertPlan: (plan: DoctorMeetingPlan) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

export const useDoctorPlanStore = create<State>((set) => ({
  plans: [],
  loading: false,
  saving: false,
  setPlans: (plans) => set({ plans }),
  upsertPlan: (plan) =>
    set((state) => {
      const index = state.plans.findIndex((item) => item.id === plan.id);

      if (index >= 0) {
        const next = [...state.plans];
        next[index] = plan;
        return { plans: next };
      }

      return { plans: [...state.plans, plan] };
    }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
}));