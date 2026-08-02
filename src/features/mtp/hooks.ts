import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMtpRecords, updateMtpStatus } from "@/features/mtp/service";
import { queryKeys } from "@/lib/queryKeys";
import type { MtpRecord, PaginatedQuery } from "@/types/domain";

export function useMtpRecords(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getMtpRecords(params),
    queryKey: [queryKeys.mtp, params],
  });
}

export function useUpdateMtpStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; remarks: string | null; status: MtpRecord["status"] }) => updateMtpStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKeys.mtp] });
    },
  });
}
