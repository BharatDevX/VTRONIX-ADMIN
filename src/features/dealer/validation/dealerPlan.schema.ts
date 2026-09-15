import { z } from "zod";

export const DealerMeetingPlanSchema = z.object({
  dealer_id: z.string().min(1),
  location: z.string().min(1),
  planned_date: z.string(),
  discussion: z.string().min(1),
});

export type DealerMeetingPlanType = z.infer<typeof DealerMeetingPlanSchema>;
