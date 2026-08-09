import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { createDoctor, deleteDoctor, getDoctors, toggleDoctorStatus, updateDoctor } from "./service";
import type { Doctor, PaginatedQuery } from "@/types/domain";

const QUERY_KEY = queryKeys.doctors;

export function useDoctors(params: PaginatedQuery) {
  return useQuery({
    queryFn: () => getDoctors(params),
    queryKey: [QUERY_KEY, params],
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Doctor, "id" | "created_at" | "updated_at">) => createDoctor(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Doctor, "id" | "created_at" | "updated_at">> }) => updateDoctor(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useToggleDoctorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => toggleDoctorStatus(id, is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
