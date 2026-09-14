import { useCallback, useEffect, useState } from "react";
import { getCounterSales } from "../services/counterSale.service";
import { useCounterSaleStore } from "../store/counterSale.store";

export function useCounterSale(employeeId: string) {
  const { reports, loading, setReports, setLoading } = useCounterSaleStore();
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
      const data = await getCounterSales(employeeId);
      setReports(data ?? []);
    } catch (error) {
      console.error("Failed to load counter sales", error);
      setReports([]);
      setError(error instanceof Error ? error.message : "Unable to load the counter sales report right now.");
    } finally {
      setLoading(false);
    }
  }, [employeeId, setLoading, setReports]);

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
