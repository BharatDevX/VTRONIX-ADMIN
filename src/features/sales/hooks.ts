import { useQuery } from "@tanstack/react-query";

import { getSales } from "@/features/sales/service";
import { queryKeys } from "@/lib/queryKeys";
import type { PaginatedQuery } from "@/types/domain";

export function useSales(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getSales(params),
    queryKey: [queryKeys.sales, params],
  });
}
