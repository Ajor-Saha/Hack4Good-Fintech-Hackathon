import { z } from "zod";

export const stockSchema = z.object({
  symbol: z
    .string()
    .min(1, { message: "Symbol is required" })
    .max(5, { message: "Symbol cannot exceed 5 characters" }), // Common stock symbols are typically 1-5 characters
  price: z
    .number()
    .min(0, { message: "Price must be greater than or equal to 0" })
    .max(1000000, { message: "Price exceeds the maximum limit" }),
  volume: z
    .number()
    .min(1, { message: "Volume must be greater than 0" })
    .max(1000000000, { message: "Volume exceeds the maximum limit" }), // Assuming a large enough upper limit for volume
});
