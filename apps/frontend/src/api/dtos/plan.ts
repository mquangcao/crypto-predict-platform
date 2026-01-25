import { z } from "zod";

// Plan DTO Schema
export const PlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  features: z.array(z.string()),
  monthlyPrice: z.coerce.number(),
  yearlyPrice: z.coerce.number(),
  monthlyDiscountPrice: z.coerce.number().nullable(),
  yearlyDiscountPrice: z.coerce.number().nullable(),
  isPopular: z.boolean(),
  tag: z.string().nullable(),
  cta: z.string(),
  href: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Response Schema for list of plans
export const PlansResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.array(PlanSchema),
});

// Response Schema for single plan
export const PlanResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: PlanSchema,
});

// Type exports
export type Plan = z.infer<typeof PlanSchema>;
export type PlansResponse = z.infer<typeof PlansResponseSchema>;
export type PlanResponse = z.infer<typeof PlanResponseSchema>;
