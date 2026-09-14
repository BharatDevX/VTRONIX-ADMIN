import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "../services/incentive.service";
import { useIncentiveStore } from "../store/incentive.store";

export function useIncentive(employeeId: string) {
  const { dashboard, loading, setDashboard, setLoading } = useIncentiveStore();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!employeeId) {
      setDashboard({
        target: 0,
        achieved: 0,
        achievement: 0,
        incentive: 0,
      });
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getDashboard(employeeId);
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load incentive dashboard", error);
      setError(error instanceof Error ? error.message : "Unable to load the incentive dashboard right now.");
      setDashboard({
        target: 0,
        achieved: 0,
        achievement: 0,
        incentive: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [employeeId, setDashboard, setLoading]);

  useEffect(() => {
    load();
  }, [employeeId, load]);

  return {
    dashboard,
    loading,
    error,
    reload: load,
  };
}
