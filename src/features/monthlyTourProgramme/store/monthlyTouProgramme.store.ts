import { create } from "zustand";

import {
  MonthlyTourProgramme,
  MonthlyTourProgrammeWithEntries,
  MonthlyTourEntry,
  MonthlyTourSummary,
} from "../types/monthlyTourProgramme.types";

import { MonthlyTourProgrammeService } from "../services/monthlyTourProgramme.service";

interface MonthlyTourProgrammeStore {
  programme: MonthlyTourProgramme | null;

  entries: MonthlyTourEntry[];

  summary: MonthlyTourSummary;

  loading: boolean;

  saving: boolean;

  error: string | null;

  loadProgramme: (
    employeeId: string,
    month: number,
    year: number
  ) => Promise<void>;

  createProgramme: (payload: {
    employee_id: string;
    month: number;
    year: number;
    designation?: string | null;
    hq?: string | null;
  }) => Promise<void>;

  addEntry: (
    entry: Omit<
      MonthlyTourEntry,
      "id" | "created_at" | "updated_at"
    >
  ) => Promise<void>;

  updateEntry: (
    id: string,
    payload: Partial<MonthlyTourEntry>
  ) => Promise<void>;

  deleteEntry: (id: string) => Promise<void>;

  submitProgramme: () => Promise<void>;

  clear: () => void;
}

const emptySummary: MonthlyTourSummary = {
  plannedDays: 0,
  totalTours: 0,
  totalKm: 0,
};

export const useMonthlyTourProgrammeStore =
  create<MonthlyTourProgrammeStore>((set, get) => ({
    programme: null,

    entries: [],

    summary: emptySummary,

    loading: false,

    saving: false,

    error: null,

    async loadProgramme(employeeId, month, year) {
      try {
        set({
          loading: true,
          error: null,
        });

        const data =
          await MonthlyTourProgrammeService.getProgrammeWithEntries(
            employeeId,
            month,
            year
          );

        if (!data) {
          set({
            programme: null,
            entries: [],
            summary: emptySummary,
            loading: false,
          });

          return;
        }

        set({
          programme: data,
          entries: data.entries,
          summary:
            MonthlyTourProgrammeService.calculateSummary(
              data.entries
            ),
          loading: false,
        });
      } catch (e: any) {
        set({
          loading: false,
          error: e.message,
        });
      }
    },

    async createProgramme(payload) {
      try {
        set({ saving: true, error: null });

        const programme =
          await MonthlyTourProgrammeService.createProgramme(
            payload
          );

        set({
          programme,
          saving: false,
        });
      } catch (e: any) {
        set({
          saving: false,
          error: e.message,
        });
        throw e;
      }
    },

    async addEntry(entry) {
      try {
        if (!get().programme?.id) {
          throw new Error("Please create a monthly tour programme first.");
        }

        const newEntry =
          await MonthlyTourProgrammeService.addEntry(
            entry
          );

        const entries = [...get().entries, newEntry];

        set({
          entries,
          summary:
            MonthlyTourProgrammeService.calculateSummary(
              entries
            ),
        });
      } catch (e: any) {
        set({
          error: e.message,
        });
        throw e;
      }
    },

    async updateEntry(id, payload) {
      try {
        if (!get().programme?.id) {
          throw new Error("Please create a monthly tour programme first.");
        }

        const updated =
          await MonthlyTourProgrammeService.updateEntry(
            id,
            payload
          );

        const entries = get().entries.map((e) =>
          e.id === id ? updated : e
        );

        set({
          entries,
          summary:
            MonthlyTourProgrammeService.calculateSummary(
              entries
            ),
        });
      } catch (e: any) {
        set({
          error: e.message,
        });
      }
    },

    async deleteEntry(id) {
      try {
        await MonthlyTourProgrammeService.deleteEntry(id);

        const entries = get().entries.filter(
          (e) => e.id !== id
        );

        set({
          entries,
          summary:
            MonthlyTourProgrammeService.calculateSummary(
              entries
            ),
        });
      } catch (e: any) {
        set({
          error: e.message,
        });
      }
    },

    async submitProgramme() {
      const programme = get().programme;

      if (!programme) return;

      try {
        const updated =
          await MonthlyTourProgrammeService.submitProgramme(
            programme.id
          );

        set({
          programme: updated,
        });
      } catch (e: any) {
        set({
          error: e.message,
        });
      }
    },

    clear() {
      set({
        programme: null,
        entries: [],
        summary: emptySummary,
        loading: false,
        saving: false,
        error: null,
      });
    },
  }));