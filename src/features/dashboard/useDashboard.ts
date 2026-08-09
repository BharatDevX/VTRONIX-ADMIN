import { useQuery } from "@tanstack/react-query";

import { getDashboardStats, getDashboardTrends, getRecentActivities, getTopPerformers } from "@/features/dashboard/dashboard.service";
import { queryKeys } from "@/lib/queryKeys";
import {getEmployeeWiseSales} from "@/features/dashboard/dashboard.service";
export function useDashboardStats() {
  return useQuery({
    queryFn: getDashboardStats,
    queryKey: [queryKeys.dashboard, "stats"],
  });
}
export function useEmployeeWiseSales() {
  return useQuery({
    queryKey: [queryKeys.dashboard, "employee-sales"],
    queryFn: getEmployeeWiseSales,
  });
}
export function useDashboardTrends() {
  return useQuery({
    queryFn: getDashboardTrends,
    queryKey: [queryKeys.dashboard, "trends"],
  });
}

export function useRecentActivities() {
  return useQuery({
    queryFn: getRecentActivities,
    queryKey: [queryKeys.dashboard, "activities"],
  });
}

export function useTopPerformers() {
  return useQuery({
    queryFn: getTopPerformers,
    queryKey: [queryKeys.dashboard, "performers"],
  });
}
