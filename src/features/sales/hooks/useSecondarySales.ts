import { useCallback, useEffect, useState } from "react";
import { getSecondarySales } from "../services/secondarySales.service";
import { useSecondarySalesStore } from "../store/secondarySales.store";

export function useSecondarySales(employeeId: string, saleDate?: string) {
  const { reports, loading, setReports, setLoading } = useSecondarySalesStore();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!employeeId) {
      setReports([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSecondarySales(employeeId, saleDate);
      setReports(data ?? []);
    } catch (error) {
      console.error("Failed to load secondary sales", error);
      setReports([]);
      setError(error instanceof Error ? error.message : "Unable to load the secondary sales report right now.");
    } finally {
      setLoading(false);
    }
  }, [employeeId, saleDate, setLoading, setReports]);

  useEffect(() => {
    load();
  }, [employeeId, load]);

  return {
    reports,
    loading,
    error,
    reload: load,
  };
}
