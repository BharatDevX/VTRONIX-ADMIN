import { useCallback, useEffect, useState } from "react";
import { getDoctorWiseSales } from "../services/doctorWiseSale.service";
import { useDoctorWiseSalesStore } from "../store/doctorWiseSales.store";

export function useDoctorWiseSales(employeeId: string) {
  const { reports, loading, setReports, setLoading } = useDoctorWiseSalesStore();
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
      const data = await getDoctorWiseSales(employeeId);
      setReports(data ?? []);
    } catch (error) {
      console.error("Failed to load doctor sales", error);
      setReports([]);
      setError(error instanceof Error ? error.message : "Unable to load the doctor sales report right now.");
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
