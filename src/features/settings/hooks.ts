import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getOrganizationSettings, saveOrganizationSettings, type OrganizationSettings } from "@/features/settings/service";
import { queryKeys } from "@/lib/queryKeys";

export function useOrganizationSettings() {
  return useQuery({
    queryFn: getOrganizationSettings,
    queryKey: [queryKeys.settings, "organization"],
  });
}

export function useSaveOrganizationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<OrganizationSettings>) => saveOrganizationSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKeys.settings] });
    },
  });
}
