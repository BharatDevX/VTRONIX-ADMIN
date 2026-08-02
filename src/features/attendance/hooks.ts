import { useQuery } from "@tanstack/react-query";

import { getAttendance } from "@/features/attendance/service";
import { queryKeys } from "@/lib/queryKeys";
import type { PaginatedQuery } from "@/types/domain";

export function useAttendance(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getAttendance(params),
    queryKey: [queryKeys.attendance, params],
  });
}
