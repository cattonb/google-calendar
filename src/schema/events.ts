import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  durationInMinutes: z.coerce
    .number()
    .int()
    .positive()
    .max(60 * 12),
});

export type EventFormType = z.infer<typeof eventFormSchema>;
