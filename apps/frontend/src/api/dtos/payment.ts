import { z } from "zod";

export const PaymentMethodEnum = z.enum(["MOMO"]);

export const InitiateUpgradeSchema = z.object({
  method: PaymentMethodEnum,
  planId: z.string(),
  interval: z.enum(["month", "year"]),
  description: z.string().optional(),
  redirectUrl: z.string().url(),
  customerInfo: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const PaymentResultSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    success: z.boolean(),
    status: z.string(),
    transactionId: z.string().optional(),
    message: z.string().optional(),
    paymentUrl: z.string().optional(),
    qrCode: z.string().optional(),
    expiresAt: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const MomoCallbackSchema = z.object({
  partnerCode: z.string(),
  orderId: z.string(),
  requestId: z.string(),
  amount: z.string(),
  orderInfo: z.string(),
  orderType: z.string(),
  transId: z.string(),
  resultCode: z.string(),
  message: z.string(),
  payType: z.string(),
  responseTime: z.string(),
  extraData: z.string().optional(),
  signature: z.string(),
});

export const PaymentVerificationSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    transactionId: z.string(),
    status: z.string(),
    verifiedAt: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export type InitiateUpgrade = z.infer<typeof InitiateUpgradeSchema>;
export type PaymentResult = z.infer<typeof PaymentResultSchema>;
export type MomoCallback = z.infer<typeof MomoCallbackSchema>;
export type PaymentVerification = z.infer<typeof PaymentVerificationSchema>;
