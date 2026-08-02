import { useQuery } from "@tanstack/react-query";

import { getReportSummary } from "@/features/reports/service";
import { queryKeys } from "@/lib/queryKeys";

export function useReportSummary() {
  return useQuery({
    queryFn: getReportSummary,
    queryKey: [queryKeys.reports, "summary"],
  });
}
