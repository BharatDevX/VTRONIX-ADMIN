import { z } from "zod";

export const FarmerVisitSchema = z.object({
  farmer_name: z.string().min(1),
  visit_date: z.string(),
  visit_time: z.string(),
  location: z.string().min(1),
  discussion: z.string().min(1),
  outcome: z.string().min(1),
  next_followup_date: z.string(),
});

export type FarmerVisitType = z.infer<typeof FarmerVisitSchema>;
