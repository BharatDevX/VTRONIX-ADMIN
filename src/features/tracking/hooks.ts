import { useQuery } from "@tanstack/react-query";

import { getLiveLocations } from "@/features/tracking/service";
import { queryKeys } from "@/lib/queryKeys";

export function useLiveLocations() {
  return useQuery({
    queryFn: getLiveLocations,
    queryKey: [queryKeys.tracking, "live"],
    refetchInterval: 60_000,
  });
}
