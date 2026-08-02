import { useQuery } from "@tanstack/react-query";

import { getDealerVisits } from "@/features/dealer/service";
import { queryKeys } from "@/lib/queryKeys";
import type { PaginatedQuery } from "@/types/domain";

export function useDealerVisits(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getDealerVisits(params),
    queryKey: [queryKeys.dealer, params],
  });
}
