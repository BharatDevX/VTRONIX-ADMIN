import { useEffect } from "react";

import { getDealerVisits, saveDealerVisit } from "../services/dealerVisit.service";
import type { DealerVisitForm } from "../types/dealerVisit.types";
import { useDealerVisitStore } from "../store/dealerVisit.store";

export function useDealerVisit(employeeId: string) {
  const { visits, loading, saving, setVisits, upsertVisit, setLoading, setSaving } = useDealerVisitStore();

  async function loadVisits() {
    setLoading(true);

    try {
      const data = await getDealerVisits(employeeId);
      setVisits(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function save(form: DealerVisitForm) {
    if (saving) {
      return { data: null, isUpdate: false };
    }

    setSaving(true);

    try {
      const result = await saveDealerVisit(employeeId, form);
      upsertVisit(result.data);
      return result;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (employeeId) {
      loadVisits();
    }
  }, [employeeId]);

  return {
    visits,
    loading,
    saving,
    save,
    reload: loadVisits,
  };
}