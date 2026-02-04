import { z } from "zod";
import {
  InitiateUpgradeSchema,
  PaymentResultSchema,
  PaymentVerificationSchema,
} from "@/api/dtos";
import { createPostMutationHook } from "@/api/helpers";

export const useInitiateUpgrade = createPostMutationHook({
  endpoint: "/payments/initiate",
  bodySchema: InitiateUpgradeSchema,
  responseSchema: PaymentResultSchema,
});

export const useHandlePaymentCallback = createPostMutationHook({
  endpoint: "/payments/callback/:method",
  bodySchema: z.any(), // Since it's dynamic callback data
  responseSchema: PaymentVerificationSchema,
});
