export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  message?: string;
  paymentUrl?: string; // For online payment methods (Momo, Bank Transfer)
  qrCode?: string; // For QR code payments
  expiresAt?: Date; // For time-limited payment URLs
  metadata?: Record<string, any>;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  redirectUrl?: string; // URL to redirect after payment (required for Momo, Bank Transfer)
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

export interface PaymentVerification {
  transactionId: string;
  status: PaymentStatus;
  verifiedAt: Date;
  metadata?: Record<string, any>;
}
