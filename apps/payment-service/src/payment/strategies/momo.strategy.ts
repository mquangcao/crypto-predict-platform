import { Repository } from 'typeorm';

import { getConfig } from '@app/common';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosService } from '@app/core';

import { PaymentActionType, PaymentLogEntity } from '../entities/payment-log.entity';
import {
  MomoApiPaymentRequest,
  MomoApiPaymentResponse,
  MomoCallbackData,
  MomoConfig,
  PaymentMethod,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  PaymentVerification,
} from '../interfaces';
import { MomoCryptoUtil } from '../utils/momo-crypto.util';
import { BasePaymentStrategy } from './base.strategy';
import { PaymentTransactionEntity } from '../entities/payment-transaction.entity';
import { KafkaService } from '@app/core';
import { PAYMENT_EVENT } from '@app/common';

/**
 * Momo payment strategy
 * Handles Momo e-wallet payments
 */
@Injectable()
export class MomoPaymentStrategy extends BasePaymentStrategy {
  readonly method = PaymentMethod.MOMO;
  private readonly config: MomoConfig;

  constructor(
    @InjectRepository(PaymentTransactionEntity)
    private readonly transactionRepo: Repository<PaymentTransactionEntity>,
    @InjectRepository(PaymentLogEntity)
    private readonly logRepo: Repository<PaymentLogEntity>,
    private readonly axiosService: AxiosService,
    private readonly kafkaService: KafkaService,
  ) {
    super('MomoPaymentStrategy');

    this.config = {
      partnerCode: getConfig<string>('payment.momo.partnerCode'),
      accessKey: getConfig<string>('payment.momo.accessKey'),
      secretKey: getConfig<string>('payment.momo.secretKey'),
      apiEndpoint: getConfig<string>('payment.momo.apiEndpoint'),
      ipnUrl: getConfig<string>('payment.momo.ipnUrl'),
      partnerName: getConfig<string>('payment.momo.partnerName'),
      storeId: getConfig<string>('payment.momo.storeId'),
    };
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      this.validatePaymentRequest(request);

      // Validate redirectUrl for Momo
      if (!request.redirectUrl) {
        throw new BadRequestException('redirectUrl is required for Momo payment');
      }

      const transactionId = this.generateTransactionId('MOMO');
      const requestId = transactionId;
      const orderId = request.orderId;
      const amount = request.amount.toString();

      this.logPaymentActivity('Initiate Momo Payment', {
        orderId: request.orderId,
        amount: request.amount,
        transactionId,
      });

      // Create raw signature
      const rawSignature = MomoCryptoUtil.createPaymentRawSignature({
        accessKey: this.config.accessKey,
        amount,
        extraData: request.metadata
          ? Buffer.from(JSON.stringify(request.metadata)).toString('base64')
          : '',
        ipnUrl: this.config.ipnUrl,
        orderId,
        orderInfo: request.description || `Payment for order ${request.orderId}`,
        partnerCode: this.config.partnerCode,
        redirectUrl: request.redirectUrl,
        requestId,
        requestType: 'payWithMethod',
      });

      // Create signature
      const signature = MomoCryptoUtil.createSignature(rawSignature, this.config.secretKey);

      // Prepare request body
      const momoRequest: MomoApiPaymentRequest = {
        partnerCode: this.config.partnerCode,
        partnerName: this.config.partnerName,
        storeId: this.config.storeId,
        requestId,
        amount,
        orderId,
        orderInfo: request.description || `Payment for order ${request.orderId}`,
        redirectUrl: request.redirectUrl,
        ipnUrl: this.config.ipnUrl,
        lang: 'vi',
        requestType: 'payWithMethod',
        autoCapture: true,
        extraData: request.metadata
          ? Buffer.from(JSON.stringify(request.metadata)).toString('base64')
          : '',
        orderGroupId: '',
        signature,
      };

      // Call Momo API
      const momoResponse = await this.axiosService.post<MomoApiPaymentResponse>(
        `${this.config.apiEndpoint}/v2/gateway/api/create`,
        momoRequest,
      );

      // Check result code
      if (momoResponse.resultCode !== 0) {
        this.logger.error('Momo API Error', momoResponse);
        return this.createFailureResult(momoResponse.message || 'Momo payment failed', {
          momoResultCode: momoResponse.resultCode,
          momoMessage: momoResponse.message,
        });
      }

      // Calculate expiry time (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Save transaction to database
      const transaction = this.transactionRepo.create({
        orderId: request.orderId,
        method: PaymentMethod.MOMO,
        amount: request.amount,
        currency: request.currency || 'VND',
        description: request.description,
        status: PaymentStatus.PENDING,
        transactionId,
        paymentUrl: momoResponse.payUrl,
        qrCode: momoResponse.qrCodeUrl,
        expiresAt,
        customerInfo: request.customerInfo,
        userId: request.metadata?.userId,
        metadata: {
          ...request.metadata,
          momoRequestId: requestId,
          deeplink: momoResponse.deeplink,
          applink: momoResponse.applink,
        },
      });

      await this.transactionRepo.save(transaction);

      // Create log entry
      await this.logRepo.save(
        this.logRepo.create({
          paymentId: transaction.id,
          action: PaymentActionType.INITIATED,
          previousStatus: null,
          newStatus: PaymentStatus.PENDING,
          data: {
            orderId: request.orderId,
            amount: request.amount,
            method: PaymentMethod.MOMO,
          },
          message: 'Momo payment initiated',
        }),
      );

      return this.createPendingResult(transactionId, 'Momo payment initiated', {
        paymentUrl: momoResponse.payUrl,
        qrCode: momoResponse.qrCodeUrl,
        expiresAt,
        metadata: {
          deeplink: momoResponse.deeplink,
          applink: momoResponse.applink,
          deeplinkMiniApp: momoResponse.deeplinkMiniApp,
        },
      });
    } catch (error) {
      this.logger.error('Momo Payment Initiation Error', error);
      return this.handlePaymentError(error, 'initiation');
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      this.logPaymentActivity('Verify Momo Payment', { transactionId });

      // Find transaction in database
      const transaction = await this.transactionRepo.findOne({
        where: { transactionId },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction ${transactionId} not found`);
      }

      // TODO: Can call Momo query API to check latest status
      // For now, return current status from database

      return {
        transactionId,
        status: transaction.status,
        verifiedAt: transaction.verifiedAt || new Date(),
        metadata: {
          method: PaymentMethod.MOMO,
          orderId: transaction.orderId,
          amount: transaction.amount,
        },
      };
    } catch (error) {
      return this.handlePaymentError(error, 'verification');
    }
  }

  async handleCallback(data: MomoCallbackData): Promise<PaymentVerification> {
    try {
      this.logPaymentActivity('Handle Momo Callback', { data });

      // Verify signature
      const rawSignature = MomoCryptoUtil.createCallbackRawSignature({
        accessKey: this.config.accessKey,
        amount: data.amount.toString(),
        extraData: data.extraData,
        message: data.message,
        orderId: data.orderId,
        orderInfo: data.orderInfo,
        orderType: data.orderType,
        partnerCode: data.partnerCode,
        payType: data.payType,
        requestId: data.requestId,
        responseTime: data.responseTime.toString(),
        resultCode: data.resultCode.toString(),
        transId: data.transId.toString(),
      });

      const isValidSignature = MomoCryptoUtil.verifyCallbackSignature(
        data.signature,
        rawSignature,
        this.config.secretKey,
      );

      if (!isValidSignature) {
        throw new BadRequestException('Invalid Momo callback signature');
      }

      // Find transaction by orderId
      const transaction = await this.transactionRepo.findOne({
        where: { orderId: data.orderId },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with orderId ${data.orderId} not found`);
      }

      // Determine new status based on resultCode
      const newStatus = Number(data.resultCode) === 0 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
      const previousStatus = transaction.status;

      // Update transaction
      transaction.status = newStatus;
      if (newStatus === PaymentStatus.SUCCESS) {
        transaction.verifiedAt = new Date();
      }
      transaction.metadata = {
        ...transaction.metadata,
        momoTransId: data.transId,
        momoPayType: data.payType,
        momoResultCode: data.resultCode,
        momoMessage: data.message,
      };

      await this.transactionRepo.save(transaction);

      // Emit event to Kafka if success
      if (newStatus === PaymentStatus.SUCCESS) {
        let meta = transaction.metadata;
        // extraData might be base64 from Momo
        if (typeof data.extraData === 'string' && data.extraData !== '') {
          try {
            const decoded = JSON.parse(Buffer.from(data.extraData, 'base64').toString());
            meta = { ...meta, ...decoded };
          } catch (e) {
            this.logger.warn('Failed to parse extraData', e);
          }
        }

        await this.kafkaService.emit(PAYMENT_EVENT.PAYMENT_SUCCESS, {
          userId: meta.userId,
          planId: meta.planId,
          planName: meta.planName,
          interval: meta.interval,
          amount: data.amount,
          transactionId: transaction.transactionId,
          orderId: transaction.orderId,
          verifiedAt: transaction.verifiedAt,
        });
      }

      // Log the callback
      await this.logRepo.save(
        this.logRepo.create({
          paymentId: transaction.id,
          action: PaymentActionType.CALLBACK_RECEIVED,
          previousStatus,
          newStatus,
          data: {
            momoTransId: data.transId,
            momoResultCode: data.resultCode,
            momoMessage: data.message,
          },
          message: `Momo callback received: ${data.message}`,
        }),
      );

      return {
        transactionId: transaction.transactionId,
        status: newStatus,
        verifiedAt: transaction.verifiedAt || new Date(),
        metadata: {
          momoTransId: data.transId,
          momoResultCode: data.resultCode,
          momoMessage: data.message,
        },
      };
    } catch (error) {
      this.logger.error('Momo Callback Error', error);
      return this.handlePaymentError(error, 'callback handling');
    }
  }

  async cancelPayment(transactionId: string): Promise<PaymentResult> {
    try {
      this.logPaymentActivity('Cancel Momo Payment', { transactionId });

      const transaction = await this.transactionRepo.findOne({
        where: { transactionId },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction ${transactionId} not found`);
      }

      // TODO: Call Momo refund API if payment was successful
      // For now, just update status to cancelled

      const previousStatus = transaction.status;
      transaction.status = PaymentStatus.CANCELLED;
      await this.transactionRepo.save(transaction);

      // Log the cancellation
      await this.logRepo.save(
        this.logRepo.create({
          paymentId: transaction.id,
          action: PaymentActionType.CANCELLED,
          previousStatus,
          newStatus: PaymentStatus.CANCELLED,
          message: 'Momo payment cancelled',
        }),
      );

      return this.createSuccessResult(
        transactionId,
        'Momo payment cancelled. Refund will be processed if payment was completed.',
      );
    } catch (error) {
      return this.handlePaymentError(error, 'cancellation');
    }
  }
}
