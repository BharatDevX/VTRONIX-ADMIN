import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

import {
  createEmployee,
  getEmployeeById,
  getEmployees,
  resetEmployeePassword,
  toggleEmployeeStatus,
  updateEmployee,
} from "../services/employee.service";

import type { CreateEmployeeDTO, EmployeeFilters, UpdateEmployeeDTO } from "../types/employee.types";

const QUERY_KEY = queryKeys.employees;

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryFn: () => getEmployees(filters),
    queryKey: [QUERY_KEY, filters],
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getEmployeeById(id),
    queryKey: [QUERY_KEY, id],
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmployeeDTO) => createEmployee(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeeDTO }) => updateEmployee(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useToggleEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => toggleEmployeeStatus(id, is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useResetEmployeePassword() {
  return useMutation({
    mutationFn: (id: string) => resetEmployeePassword(id),
  });
}
