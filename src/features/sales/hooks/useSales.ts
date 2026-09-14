import { useCallback, useEffect, useRef } from "react";
import { getSales, saveSale as saveSaleService } from "../services/sales.service";
import type { Sale, SaleForm } from "../types/sales.types";
import { useSalesStore } from "../store/sales.store";

interface SaveResult {
  data: Sale;
  isUpdate: boolean;
}

export function useSales(employeeId: string) {
  const { sales, loading, saving, setSales, upsertSale, setLoading, setSaving } = useSalesStore();
  const saveInFlightRef = useRef(false);

  const loadSales = useCallback(async () => {
    if (!employeeId) {
      setSales([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getSales(employeeId);
      setSales(data ?? []);
    } catch (error) {
      console.error("Failed to load sales", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, setLoading, setSales]);

  const save = useCallback(async (form: SaleForm): Promise<SaveResult> => {
    if (!employeeId) {
      throw new Error("Unable to save the order form right now.");
    }

    if (saveInFlightRef.current) {
      throw new Error("Please wait while the order form is being saved.");
    }

    saveInFlightRef.current = true;
    setSaving(true);

    try {
      const result = await saveSaleService(employeeId, form);
      upsertSale(result.data);
      return result;
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  }, [employeeId, setSaving, upsertSale]);

  useEffect(() => {
    loadSales();
  }, [employeeId, loadSales]);

  return {
    sales,
    loading,
    saving,
    save,
    reload: loadSales,
  };
}
