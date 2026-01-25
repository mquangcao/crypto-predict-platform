import { z } from "zod";

export const SubscriptionDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  planName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export type SubscriptionDto = z.infer<typeof SubscriptionDtoSchema>;
