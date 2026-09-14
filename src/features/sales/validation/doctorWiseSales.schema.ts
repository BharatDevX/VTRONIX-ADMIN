import { z } from "zod";

export const DoctorWiseSaleSchema = z.object({
  id: z.string().min(1),
  doctor_name: z.string(),
  dealer_name: z.string(),
  product_name: z.string(),
  quantity: z.number().min(1),
  rate: z.number().min(1),
  amount: z.number().min(0),
  sale_date: z.string().min(1),
});

export type DoctorWiseSaleType = z.infer<typeof DoctorWiseSaleSchema>;
