import { useQuery } from "@tanstack/react-query";

import { getDoctorVisits } from "@/features/doctor/service";
import { queryKeys } from "@/lib/queryKeys";
import type { PaginatedQuery } from "@/types/domain";

export function useDoctorVisits(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getDoctorVisits(params),
    queryKey: [queryKeys.doctor, params],
  });
}
