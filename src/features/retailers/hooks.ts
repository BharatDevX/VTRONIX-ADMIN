import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { createRetailer, deleteRetailer, getRetailers, toggleRetailerStatus, updateRetailer } from "./service";
import type { PaginatedQuery, Retailer } from "@/types/domain";

const QUERY_KEY = queryKeys.retailers;

export function useRetailers(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getRetailers(params),
    queryKey: [QUERY_KEY, params],
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateRetailer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Retailer, "id" | "created_at" | "updated_at">) => createRetailer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateRetailer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Retailer, "id" | "created_at" | "updated_at">> }) => updateRetailer(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useToggleRetailerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => toggleRetailerStatus(id, is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteRetailer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRetailer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
