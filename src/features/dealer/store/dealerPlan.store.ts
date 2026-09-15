import { create } from "zustand";

import type { DealerMeetingPlan } from "../types/dealerPlan.types";

interface State {
  plans: DealerMeetingPlan[];
  loading: boolean;
  saving: boolean;
  setPlans: (plans: DealerMeetingPlan[]) => void;
  upsertPlan: (plan: DealerMeetingPlan) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

export const useDealerPlanStore = create<State>((set) => ({
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