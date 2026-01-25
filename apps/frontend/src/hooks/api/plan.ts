import { PlansResponseSchema } from "@/api/dtos";
import { createGetQueryHook } from "@/api/helpers";

export const useGetPlans = createGetQueryHook({
  endpoint: "/plans",
  responseSchema: PlansResponseSchema,
  rQueryParams: {
    queryKey: ["plans"],
  },
});
