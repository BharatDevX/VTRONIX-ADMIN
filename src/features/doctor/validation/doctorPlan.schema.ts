import { z } from "zod";

export const DoctorMeetingPlanSchema = z.object({
  doctor_id: z.string().min(1),
  location: z.string().min(1),
  planned_date: z.string(),
  reply: z.string().max(1000).optional(),
});

export type DoctorMeetingPlanType = z.infer<typeof DoctorMeetingPlanSchema>;
