import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSalesTargets, saveSalesTarget } from "./service";

const TARGETS_KEY = ["sales-targets"];

type SaveSalesTargetVariables = {
  employeeId: string;
  month: number;
  year: number;
  targetAmount: number;
};

export function useSalesTargets(month: number, year: number) {
  return useQuery({
    queryKey: [...TARGETS_KEY, month, year],
    queryFn: () => getSalesTargets(month, year),
  });
}

export function useSaveSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, month, year, targetAmount }: SaveSalesTargetVariables) =>
      saveSalesTarget(employeeId, month, year, targetAmount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TARGETS_KEY });
    },
  });
}
