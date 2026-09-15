import { useCallback, useEffect, useState } from "react";
import { getMyOrderDeliveries } from "../services/orderDelivery.service";
import type { EmployeeOrderDelivery } from "../types/orderDelivery.types";

export function useOrderDeliveries(employeeId: string) {
  const [orders, setOrders] = useState<EmployeeOrderDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!employeeId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setOrders(await getMyOrderDeliveries(employeeId));
    } catch (err) {
      console.error("Failed to load order delivery status", err);
      setOrders([]);
      setError(err instanceof Error ? err.message : "Unable to load order delivery status right now.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { orders, loading, error, reload };
}
