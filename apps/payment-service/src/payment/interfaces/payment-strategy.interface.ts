import { PaymentRequest, PaymentResult, PaymentVerification } from './payment-result.interface';

export enum PaymentMethod {
  MOMO = 'MOMO',
}

export interface IPaymentStrategy {
  /**
   * Get the payment method name
   */
  getMethodName(): PaymentMethod;

  /**
   * Initialize a payment transaction
   * @param request Payment request details
   * @returns Payment result with transaction details
   */
  initiatePayment(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Verify payment status
   * @param transactionId Transaction ID to verify
   * @returns Payment verification result
   */
  verifyPayment(transactionId: string): Promise<PaymentVerification>;

  /**
   * Handle payment callback/webhook from payment gateway
   * @param data Callback data from payment provider
   * @returns Verification result
   */
  handleCallback(data: any): Promise<PaymentVerification>;

  /**
   * Cancel/refund a payment
   * @param transactionId Transaction ID to cancel
   * @returns Cancellation result
   */
  cancelPayment(transactionId: string): Promise<PaymentResult>;
}
