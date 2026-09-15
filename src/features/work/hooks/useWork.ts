import { useCallback, useRef, useState } from "react";
import { workService } from "../services/work.service";
import { useWorkStore } from "../store/work.store";
import { StartWorkForm, EndWorkForm } from "../types/work.types";

export function useWork(employeeId: string) {
  const { session, loading, setLoading, setSession } = useWorkStore();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const loadSession = useCallback(async () => {
    setLoading(true);

    try {
      const data = await workService.getTodaySession(employeeId);
      setSession(data);
    } finally {
      setLoading(false);
    }
  }, [employeeId, setLoading, setSession]);

  const startWork = useCallback(async (form: StartWorkForm) => {
    if (!employeeId || savingRef.current) {
      return null;
    }

    savingRef.current = true;
    setSaving(true);
    setLoading(true);

    try {
      const data = await workService.startWork(employeeId, form);
      setSession(data);
      return data;
    } finally {
      savingRef.current = false;
      setSaving(false);
      setLoading(false);
    }
  }, [employeeId, setLoading, setSession]);

  const endWork = useCallback(async (form: EndWorkForm) => {
    if (!employeeId || savingRef.current) {
      return null;
    }

    savingRef.current = true;
    setSaving(true);
    setLoading(true);

    try {
      const data = await workService.endWork(employeeId, form);
      setSession(data);
      return data;
    } finally {
      savingRef.current = false;
      setSaving(false);
      setLoading(false);
    }
  }, [employeeId, setLoading, setSession]);

  return {
    session,
    loading,
    saving,
    loadSession,
    startWork,
    endWork,
  };
}