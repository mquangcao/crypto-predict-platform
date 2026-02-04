import { BadRequestException, Logger } from '@nestjs/common';

import {
  IPaymentStrategy,
  PaymentMethod,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  PaymentVerification,
} from '../interfaces';

/**
 * Abstract base class for all payment strategies
 * Provides common functionality and enforces contract for payment methods
 */
export abstract class BasePaymentStrategy implements IPaymentStrategy {
  protected readonly logger: Logger;
  abstract readonly method: PaymentMethod;

  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  getMethodName(): PaymentMethod {
    return this.method;
  }

  abstract initiatePayment(request: PaymentRequest): Promise<PaymentResult>;

  abstract verifyPayment(transactionId: string): Promise<PaymentVerification>;

  abstract handleCallback(data: any): Promise<PaymentVerification>;

  abstract cancelPayment(transactionId: string): Promise<PaymentResult>;

  /**
   * Validate payment request data
   */
  protected validatePaymentRequest(request: PaymentRequest): void {
    if (!request.orderId) {
      throw new BadRequestException('Order ID is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    this.logger.log(
      `Validating payment request for order ${request.orderId} with amount ${request.amount}`,
    );
  }

  /**
   * Create a successful payment result
   */
  protected createSuccessResult(
    transactionId: string,
    message?: string,
    additionalData?: Partial<PaymentResult>,
  ): PaymentResult {
    return {
      success: true,
      status: PaymentStatus.SUCCESS,
      transactionId,
      message: message || 'Payment processed successfully',
      ...additionalData,
    };
  }

  /**
   * Create a failed payment result
   */
  protected createFailureResult(message: string, metadata?: Record<string, any>): PaymentResult {
    return {
      success: false,
      status: PaymentStatus.FAILED,
      message,
      metadata,
    };
  }

  /**
   * Create a pending payment result
   */
  protected createPendingResult(
    transactionId: string,
    message?: string,
    additionalData?: Partial<PaymentResult>,
  ): PaymentResult {
    return {
      success: true,
      status: PaymentStatus.PENDING,
      transactionId,
      message: message || 'Payment is pending',
      ...additionalData,
    };
  }

  /**
   * Generate a unique transaction ID
   */
  protected generateTransactionId(prefix: string = 'TXN'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Log payment activity
   */
  protected logPaymentActivity(action: string, details: any): void {
    this.logger.log(`[${this.getMethodName()}] ${action}`, JSON.stringify(details));
  }

  /**
   * Handle payment errors
   */
  protected handlePaymentError(error: any, context: string): never {
    this.logger.error(`[${this.getMethodName()}] Error in ${context}:`, error);
    throw new BadRequestException(`Payment ${context} failed: ${error.message || 'Unknown error'}`);
  }
}
