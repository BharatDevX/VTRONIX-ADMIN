import { useCallback, useMemo } from "react";

import { useMonthlyTourProgrammeStore } from "../store/monthlyTouProgramme.store";
import { MonthlyTourEntry } from "../types/monthlyTourProgramme.types";

export function useMonthlyTourProgramme() {
  const {
    programme,
    entries,
    summary,
    loading,
    saving,
    error,
    loadProgramme,
    createProgramme,
    addEntry,
    updateEntry,
    deleteEntry,
    submitProgramme,
    clear,
  } = useMonthlyTourProgrammeStore();

  const refresh = useCallback(
    async (employeeId: string, month: number, year: number) => {
      await loadProgramme(employeeId, month, year);
    },
    [loadProgramme]
  );

  const create = useCallback(createProgramme, [createProgramme]);

  const add = useCallback(
    async (
      entry: Omit<
        MonthlyTourEntry,
        "id" | "created_at" | "updated_at"
      >
    ) => {
      await addEntry(entry);
    },
    [addEntry]
  );

  const update = useCallback(
    async (id: string, payload: Partial<MonthlyTourEntry>) => {
      await updateEntry(id, payload);
    },
    [updateEntry]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteEntry(id);
    },
    [deleteEntry]
  );

  const submit = useCallback(async () => {
    await submitProgramme();
  }, [submitProgramme]);

  const isDraft = useMemo(
    () => programme?.status === "draft",
    [programme]
  );

  const isSubmitted = useMemo(
    () => programme?.status === "submitted",
    [programme]
  );

  const canEdit = useMemo(
    () =>
      programme !== null &&
      (programme.status === "draft" ||
        programme.status === "rejected"),
    [programme]
  );

  return {
    programme,
    entries,
    summary,

    loading,
    saving,
    error,

    refresh,
    create,
    add,
    update,
    remove,
    submit,
    clear,

    isDraft,
    isSubmitted,
    canEdit,
  };
}