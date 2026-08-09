import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { createDealer, deleteDealer, getDealers, toggleDealerStatus, updateDealer } from "@/features/dealers/dealerMaster.service";
import type { Dealer, PaginatedQuery } from "@/types/domain";

const QUERY_KEY = queryKeys.dealers;

export function useDealers(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getDealers(params),
    queryKey: [QUERY_KEY, params],
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Dealer, "id" | "created_at" | "updated_at">) => createDealer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Dealer, "id" | "created_at" | "updated_at">> }) => updateDealer(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useToggleDealerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => toggleDealerStatus(id, is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDealer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}