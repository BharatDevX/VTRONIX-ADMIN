import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmployeeJourney, getLiveLocations, subscribeToTracking } from "@/features/tracking/service";
import { queryKeys } from "@/lib/queryKeys";

export function useLiveLocations() {
  const queryClient = useQueryClient();
  useEffect(() => subscribeToTracking(() => { void queryClient.invalidateQueries({ queryKey: [queryKeys.tracking] }); }), [queryClient]);
  return useQuery({ queryFn: getLiveLocations, queryKey: [queryKeys.tracking, "live"], refetchInterval: 15000, staleTime: 5000 });
}

export function useEmployeeJourney(employeeId: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!employeeId) return;
    return subscribeToTracking(() => { void queryClient.invalidateQueries({ queryKey: [queryKeys.tracking, "journey", employeeId] }); });
  }, [employeeId, queryClient]);
  return useQuery({ queryKey: [queryKeys.tracking, "journey", employeeId], queryFn: () => getEmployeeJourney(employeeId), enabled: Boolean(employeeId), refetchInterval: 15000, staleTime: 5000 });
}
