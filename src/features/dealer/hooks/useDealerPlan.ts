import { useEffect } from "react";

import { createDealerPlan, getDealerPlans } from "../services/dealerPlan.service";
import type { DealerMeetingPlanForm } from "../types/dealerPlan.types";
import { useDealerPlanStore } from "../store/dealerPlan.store";

export function useDealerPlan(employeeId: string) {
  const { plans, loading, saving, setPlans, upsertPlan, setLoading, setSaving } = useDealerPlanStore();

  async function loadPlans() {
    setLoading(true);

    try {
      const data = await getDealerPlans(employeeId);
      setPlans(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function savePlan(form: DealerMeetingPlanForm) {
    if (saving) {
      return { data: null, isUpdate: false };
    }

    setSaving(true);

    try {
      const result = await createDealerPlan(employeeId, form);
      upsertPlan(result.data);
      return result;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (employeeId) {
      loadPlans();
    }
  }, [employeeId]);

  return {
    plans,
    loading,
    saving,
    savePlan,
    reload: loadPlans,
  };
}