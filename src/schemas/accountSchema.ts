import { z } from "zod";

export const accountSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  username: z.string().min(1, "Username is required"),
  monthlySalary: z.number().min(0, "Monthly Salary must be a positive number"),
});
