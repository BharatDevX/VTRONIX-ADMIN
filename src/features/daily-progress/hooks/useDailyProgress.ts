import { useCallback } from "react";

import { dailyProgressService } from "../services/dailyProgress.service";
import { useDailyProgressStore } from "../store/dailyProgress.store";

import { DailyProgressEntry } from "../types/dailyProgress.types";

export function useDailyProgress() {
  const {
    progress,
    entries,
    loading,
    setProgress,
    setEntries,
    addEntry,
    removeEntry,
    setLoading,
  } = useDailyProgressStore();

  const loadToday = useCallback(
    async (employeeId: string) => {
      setLoading(true);

      try {
        const report =
          await dailyProgressService.loadOrCreateDraft(employeeId);

        setProgress(report);

        const rows =
          await dailyProgressService.getEntries(report.id);

        setEntries(rows);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setProgress, setEntries]
  );

  const refresh = async () => {
    if (!progress) return;

    const report =
      await dailyProgressService.getTodayReport(progress.employee_id);

    if (report) {
      setProgress(report);

      const rows =
        await dailyProgressService.getEntries(report.id);

      setEntries(rows);
    }
  };

  const createEntry = async (
    values: DailyProgressEntry
  ) => {
    if (!progress) {
      throw new Error("Daily Progress not loaded.");
    }

    const serialNo =
      entries.length === 0
        ? 1
        : Math.max(
            ...entries.map((e) => e.serial_no)
          ) + 1;

    const row =
      await dailyProgressService.addEntry({
        ...values,
        daily_progress_id: progress.id,
        serial_no: serialNo,
      });

    addEntry(row);

    return row;
  };

  const updateEntry = async (
    id: string,
    values: Partial<DailyProgressEntry>
  ) => {
    await dailyProgressService.updateEntry(
      id,
      values
    );

    await refresh();
  };

  const deleteEntry = async (
    id: string
  ) => {
    await dailyProgressService.deleteEntry(id);

    removeEntry(id);
  };

  const saveDraft = async (
    remarks: string
  ) => {
    if (!progress) return;

    await dailyProgressService.saveDraft(
      progress.id,
      remarks
    );
  };

  const submit = async () => {
    if (!progress) return;

    await dailyProgressService.submitReport(
      progress.id
    );

    await refresh();
  };

  return {
    progress,
    entries,
    loading,
    loadToday,
    createEntry,
    updateEntry,
    deleteEntry,
    saveDraft,
    submit,
    refresh,
  };
}