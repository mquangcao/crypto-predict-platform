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

// Create Plan DTO Schema
export const CreatePlanSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  monthlyPrice: z.number().min(0),
  yearlyPrice: z.number().min(0),
  isPopular: z.boolean().optional(),
  tag: z.string().optional(),
  cta: z.string().optional(),
  href: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Update Plan DTO Schema
export const UpdatePlanSchema = CreatePlanSchema.partial();

// Discount Plan DTO Schema
export const DiscountPlanSchema = z.object({
  monthlyDiscountPrice: z.number().nullable().optional(),
  yearlyDiscountPrice: z.number().nullable().optional(),
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
