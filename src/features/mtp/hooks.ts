import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMtpProgrammeEntries, getMtpRecords, updateMtpStatus } from "@/features/mtp/service";
import { queryKeys } from "@/lib/queryKeys";
import type { MtpRecord, PaginatedQuery } from "@/types/domain";

export function useMtpRecords(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getMtpRecords(params),
    queryKey: [queryKeys.mtp, params],
  });
}

export function useMtpProgrammeEntries(programmeId: string | null) {
  return useQuery({
    enabled: Boolean(programmeId),
    queryFn: () => getMtpProgrammeEntries(programmeId as string),
    queryKey: [queryKeys.mtp, "entries", programmeId],
    staleTime: 1000 * 60,
  });
}

export function useUpdateMtpStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remarks, status }: { id: string; remarks: string | null; status: MtpRecord["status"] }) => updateMtpStatus(id, status, remarks),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKeys.mtp] });
    },
  });
}