import { z } from "zod";


export const budgetSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters.' })
        .max(20, { message: 'Name must not be longer than 20 characters.' }),
    limit: z
        .number()
        .positive({ message: 'Limit must be a positive number.' })
});