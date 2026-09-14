import { z } from "zod";

export const SaleSchema = z.object({
  retailer_id: z.string().optional(),
  dealer_id: z.string().min(1),
  product_ids: z.array(z.string()).min(1, "Please select at least one medicine."),
  sale_date: z.string(),
  quantity: z.number().min(1),
  rate: z.number().min(1),
  sale_type: z.enum(["dealer", "retailer", "farmer"]),
}).refine(
  (value) => value.sale_type !== "retailer" || Boolean(value.retailer_id?.trim()),
  {
    message: "Please select a retailer for retailer sales.",
    path: ["retailer_id"],
  },
);

export type SaleType = z.infer<typeof SaleSchema>["sale_type"];
