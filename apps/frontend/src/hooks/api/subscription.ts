import { z } from "zod";
import { BaseResponseSchema } from "@/api/common";
import { SubscriptionDtoSchema } from "@/api/dtos/subscription";
import { createGetQueryHook } from "@/api/helpers";

const QUERY_KEY = "subscription";
const BASE_ENDPOINT = "/subscriptions";

export const useGetMySubscription = createGetQueryHook({
  endpoint: `${BASE_ENDPOINT}/me`,
  responseSchema: BaseResponseSchema(SubscriptionDtoSchema.nullable()),
  rQueryParams: { queryKey: [QUERY_KEY, "me"] as any },
});

export const useCheckVip = createGetQueryHook({
  endpoint: `${BASE_ENDPOINT}/check-vip`,
  responseSchema: BaseResponseSchema(z.boolean().nullable()),
  rQueryParams: { queryKey: [QUERY_KEY, "check-vip"] as any },
});
