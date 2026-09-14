import dayjs from "dayjs";
import { supabase } from "../../../services/supabase/supabase";
import { IncentiveDashboard } from "../types/incentive.types";

interface IncentiveSaleRow {
  amount: number | null;
}

interface SalesTargetRow {
  target: number | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: string }).message ?? "");
  }

  return "";
}

function toFriendlyError(error: unknown): Error {
  const message = getErrorMessage(error).toLowerCase();

  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return new Error("Network issue. Please check your connection and try again.");
  }

  return new Error("Unable to load the incentive dashboard right now.");
}

async function getMonthlyTarget(employeeId: string, month: number, year: number): Promise<number> {
  const { data, error } = await supabase
    .from("sales_targets")
    .select("target_amount")
    .eq("employee_id", employeeId)
    .eq("month", month)
    .eq("year", year)
    .limit(1)
    .maybeSingle();

  if (error) throw toFriendlyError(error);

  return Number(((data ?? null) as SalesTargetRow | null)?.target ?? 0);
}

export async function getDashboard(employeeId: string): Promise<IncentiveDashboard> {
  if (!employeeId) {
    return {
      target: 0,
      achieved: 0,
      achievement: 0,
      incentive: 0,
    };
  }

  const today = dayjs();
  const month = today.month() + 1;
  const year = today.year();
  const monthStart = today.startOf("month").format("YYYY-MM-DD");
  const monthEnd = today.endOf("month").format("YYYY-MM-DD");
  const target = await getMonthlyTarget(employeeId, month, year);

  const { data, error } = await supabase
    .from("sales")
    .select("amount")
    .eq("employee_id", employeeId)
    .gte("sale_date", monthStart)
    .lte("sale_date", monthEnd)
    .order("sale_date", {
      ascending: false,
    })
    .order("created_at", { ascending: false });

  if (error) throw toFriendlyError(error);

  let achieved = 0;

  ((data ?? []) as IncentiveSaleRow[]).forEach((item) => {
    achieved += Number(item.amount ?? 0);
  });

  const achievement = target > 0 ? (achieved / target) * 100 : 0;
  const incentive = achieved * 0.05;

  const dashboard: IncentiveDashboard = {
    target,
    achieved,
    achievement,
    incentive,
  };

  return dashboard;
}
