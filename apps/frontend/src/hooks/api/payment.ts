import { InitiateUpgradeSchema, PaymentResultSchema } from "@/api/dtos";
import { createPostMutationHook } from "@/api/helpers";

export const useInitiateUpgrade = createPostMutationHook({
  endpoint: "/payments/initiate",
  bodySchema: InitiateUpgradeSchema,
  responseSchema: PaymentResultSchema,
});
