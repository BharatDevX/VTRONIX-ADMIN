import { z } from "zod";

export const employeeSchema = z.object({
  employee_id: z
    .string()
    .trim()
    .min(3, "Employee ID is required"),

  full_name: z
    .string()
    .trim()
    .min(3, "Full name is required"),

  designation: z
    .string()
    .trim()
    .min(2, "Designation is required"),

  branch: z
    .string()
    .trim()
    .min(2, "Branch is required"),

  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter valid mobile number"),

  email: z
    .email("Enter valid email"),

  password: z
    .string()
    .min(6, "Password must contain at least 6 characters"),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const employeeEditSchema = employeeSchema.omit({ employee_id: true, password: true });

export type EmployeeEditFormData = z.infer<typeof employeeEditSchema>;
