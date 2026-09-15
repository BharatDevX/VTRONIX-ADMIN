import { create } from "zustand";

import { WorkSession } from "../types/work.types";

interface State {
  session: WorkSession | null;
  loading: boolean;
  setSession: (session: WorkSession | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkStore = create<State>((set) => ({
  session: null,
  loading: false,
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
}));