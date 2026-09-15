import { create } from "zustand";
import { Employee } from "../types/auth.types";

interface AuthState {
  employee: Employee | null;

  loading: boolean;

  setEmployee: (employee: Employee | null) => void;

  setLoading: (loading: boolean) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  employee: null,

  loading: false,

  setEmployee: (employee) =>
    set({
      employee,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  logout: () =>
    set({
      employee: null,
    }),
}));