import { z } from "zod";

export const expenseSchema = z.object({
  category: z.string(),
  amount: z
    .number()
    .min(1, { message: "Amount must be greater than 0" })
    .max(1000000, { message: "Amount exceeds the maximum limit" }),
  date: z.string(),
  description: z.string().optional(),
});
