import {
  PlansResponseSchema,
  PlanResponseSchema,
  CreatePlanSchema,
  UpdatePlanSchema,
  DiscountPlanSchema,
} from "@/api/dtos";
import {
  createGetQueryHook,
  createPostMutationHook,
  createPutMutationHook,
  createPatchMutationHook,
  createDeleteMutationHook,
} from "@/api/helpers";

export const useGetPlans = createGetQueryHook({
  endpoint: "/plans",
  responseSchema: PlansResponseSchema,
  rQueryParams: {
    queryKey: ["plans"],
  },
});

export const useGetAdminPlans = createGetQueryHook({
  endpoint: "/plans/all",
  responseSchema: PlansResponseSchema,
  rQueryParams: {
    queryKey: ["admin", "plans"] as [string, ...any[]],
  },
});

export const useCreatePlan = createPostMutationHook({
  endpoint: "/plans",
  bodySchema: CreatePlanSchema,
  responseSchema: PlanResponseSchema,
});

export const useUpdatePlan = createPutMutationHook({
  endpoint: "/plans/:id",
  bodySchema: UpdatePlanSchema,
  responseSchema: PlanResponseSchema,
});

export const useDeletePlan = createDeleteMutationHook({
  endpoint: "/plans/:id",
});

export const useApplyDiscount = createPatchMutationHook({
  endpoint: "/plans/:id/discount",
  bodySchema: DiscountPlanSchema,
  responseSchema: PlanResponseSchema,
});

export const useRemoveDiscount = createDeleteMutationHook({
  endpoint: "/plans/:id/discount",
});
