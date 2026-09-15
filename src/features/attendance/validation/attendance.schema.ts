import { z } from "zod";

export const AttendanceSchema = z.object({
  status: z.enum([
    "PRESENT",
    "ABSENT",
    "LEAVE",
    "HALF_DAY",
  ]),

  remarks: z
    .string()
    .max(250)
    .optional(),
});

export type AttendanceSchemaType =
  z.infer<typeof AttendanceSchema>;