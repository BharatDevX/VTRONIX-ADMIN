import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSaleDelivery,
  getSaleDeliveryData,
  uploadSaleInvoice,
} from "./service";

export function useSaleDeliveryData(saleId: string | null, orderedAmount: number) {
  return useQuery({
    enabled: Boolean(saleId),
    queryKey: ["sale-delivery", saleId],
    queryFn: () => getSaleDeliveryData(saleId as string, orderedAmount),
  });
}

export function useCreateSaleDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSaleDelivery,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["sale-delivery", variables.saleId] });
      void queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useUploadSaleInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadSaleInvoice,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["sale-delivery", variables.saleId] });
    },
  });
}
