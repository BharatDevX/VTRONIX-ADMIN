import { z } from "zod";

export const LoginSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;