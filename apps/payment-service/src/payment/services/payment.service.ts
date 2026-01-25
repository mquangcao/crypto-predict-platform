import { PLAN_OPERATION, SERVICE, SUBSCRIPTION_OPERATION } from '@app/common';
import { GatewayService } from '@app/core';
import { Repository } from 'typeorm';

import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PAYMENT_STRATEGIES } from '../constants';
import { PaymentTransactionEntity } from '../entities/payment-transaction.entity';
import {
  PaymentMethod,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  PaymentVerification,
} from '../interfaces';
import type { BasePaymentStrategy } from '../strategies';

/**
 * Payment service that manages different payment strategies
 */
@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_STRATEGIES)
    private readonly strategies: BasePaymentStrategy[],
    @InjectRepository(PaymentTransactionEntity)
    private readonly transactionRepo: Repository<PaymentTransactionEntity>,
    private readonly gateway: GatewayService,
  ) {}

  /**
   * Get a specific payment strategy by method
   */
  private getStrategy(method: PaymentMethod): BasePaymentStrategy {
    const strategy = this.strategies.find(s => s.method === method);
    if (!strategy) {
      throw new NotFoundException(`Payment strategy for method '${method}' not found`);
    }
    return strategy;
  }

  /**
   * Get all available payment methods
   */
  getAvailableMethods(): PaymentMethod[] {
    return this.strategies.map(s => s.method);
  }

  /**
   * Initiate upgrade payment
   */
  async initiateUpgrade(dto: {
    planId: string;
    interval: 'month' | 'year';
    method: PaymentMethod;
    redirectUrl: string;
    description?: string;
    customerInfo?: any;
    metadata?: any;
  }): Promise<PaymentResult> {
    // 1. Get plan info from plan-service
    const planInfo = await this.gateway.runOperation<any>({
      serviceId: SERVICE.PLAN,
      operationId: PLAN_OPERATION.GET_PLAN_FOR_PAYMENT,
      payload: {
        planId: dto.planId,
        interval: dto.interval,
      },
    });

    if (!planInfo) {
      throw new BadRequestException('Plan not found or invalid');
    }

    // 2. Initiate payment with the fetched amount
    const orderId = `UPGRADE-${dto.planId.toUpperCase()}-${Date.now()}`;
    const request: PaymentRequest = {
      orderId,
      amount: planInfo.price,
      currency: planInfo.currency || 'VND',
      description: dto.description || `Upgrade to ${planInfo.name} (${dto.interval})`,
      redirectUrl: dto.redirectUrl,
      customerInfo: dto.customerInfo,
      metadata: {
        ...dto.metadata,
        planId: dto.planId,
        interval: dto.interval,
        planName: planInfo.name,
        method: dto.method,
      },
    };

    const strategy = this.getStrategy(dto.method);
    return await strategy.initiatePayment(request);
  }

  /**
   * Initiate a new payment
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    const method = request.metadata?.method as PaymentMethod;
    const strategy = this.getStrategy(method);
    return await strategy.initiatePayment(request);
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    const transaction = await this.transactionRepo.findOne({
      where: { transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }

    const strategy = this.getStrategy(transaction.method);
    const verification = await strategy.verifyPayment(transactionId);

    if (verification.status === PaymentStatus.SUCCESS && transaction.status !== PaymentStatus.SUCCESS) {
      await this.notifySubscriptionService(transaction);
    }

    return verification;
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(transactionId: string): Promise<PaymentResult> {
    const transaction = await this.transactionRepo.findOne({
      where: { transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }

    const strategy = this.getStrategy(transaction.method);
    return await strategy.cancelPayment(transactionId);
  }

  /**
   * Handle payment callback from gateway
   */
  async handleCallback(method: PaymentMethod, data: any): Promise<PaymentVerification> {
    const strategy = this.getStrategy(method);
    const verification = await strategy.handleCallback(data);
    
    if (verification.status === PaymentStatus.SUCCESS) {
      const transaction = await this.transactionRepo.findOne({
        where: { transactionId: verification.transactionId },
      });
      if (transaction) {
        await this.notifySubscriptionService(transaction);
      }
    }

    return verification;
  }

  /**
   * Notify subscription service about successful payment
   */
  private async notifySubscriptionService(transaction: PaymentTransactionEntity) {
    const { userId, metadata } = transaction;
    if (userId && metadata?.planId) {
      try {
        await this.gateway.runOperation({
          serviceId: SERVICE.SUBSCRIPTION,
          operationId: SUBSCRIPTION_OPERATION.ACTIVATE_SUBSCRIPTION,
          payload: {
            userId,
            planId: metadata.planId,
            planName: metadata.planName,
            interval: metadata.interval,
            metadata: {
              ...metadata,
              transactionId: transaction.transactionId,
              orderId: transaction.orderId,
            },
          },
        });
      } catch (error) {
        console.error('Failed to notify subscription service:', error);
      }
    }
  }
}
