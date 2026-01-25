import { Public, ResponseBuilder, type TokenPayload, UserSession } from '@app/common';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { InitiatePaymentDto } from '../dtos';
import { PaymentMethod } from '../interfaces';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '@app/core';

@ApiTags('Payment')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Get available payment methods
   */
  @ApiOperation({ summary: 'Get available payment methods' })
  @ApiOkResponse({ description: 'List of available payment methods' })
  @Public()
  @Get('methods')
  getAvailableMethods() {
    const methods = this.paymentService.getAvailableMethods();
    return ResponseBuilder.createResponse({ data: { methods } });
  }

  /**
   * Initiate payment
   */
  @ApiOperation({
    summary: 'Initiate a new payment',
    description: 'Create a payment transaction with selected method',
  })
  @ApiBody({ type: InitiatePaymentDto })
  @ApiOkResponse({ description: 'Payment initiated successfully' })
  @Post('initiate')
  async initiatePayment(@Body() dto: InitiatePaymentDto, @UserSession() user?: TokenPayload) {
    const result = await this.paymentService.initiateUpgrade({
      planId: dto.planId,
      interval: dto.interval,
      method: dto.method,
      redirectUrl: dto.redirectUrl,
      description: dto.description,
      customerInfo: dto.customerInfo,
      metadata: { ...dto.metadata, userId: user?.sub },
    });

    return ResponseBuilder.createResponse({ data: result });
  }

  /**
   * Verify payment status
   */
  @ApiOperation({
    summary: 'Verify payment status',
    description: 'Check the current status of a payment transaction',
  })
  @ApiOkResponse({ description: 'Payment verification result' })
  @Get(':transactionId/verify')
  async verifyPayment(@Param('transactionId') transactionId: string) {
    const verification = await this.paymentService.verifyPayment(transactionId);
    return ResponseBuilder.createResponse({ data: verification });
  }

  /**
   * Cancel payment
   */
  @ApiOperation({
    summary: 'Cancel payment',
    description: 'Cancel a pending payment transaction',
  })
  @ApiOkResponse({ description: 'Payment cancelled successfully' })
  @Post(':transactionId/cancel')
  async cancelPayment(@Param('transactionId') transactionId: string) {
    const result = await this.paymentService.cancelPayment(transactionId);
    return ResponseBuilder.createResponse({ data: result });
  }

  /**
   * Handle payment callback/webhook
   */
  @ApiOperation({
    summary: 'Handle payment callback',
    description: 'Webhook endpoint for payment gateway callbacks',
  })
  @ApiOkResponse({ description: 'Callback processed successfully' })
  @Post('callback/:method')
  async handleCallback(@Param('method') method: PaymentMethod, @Body() data: any) {
    const verification = await this.paymentService.handleCallback(method, data);
    return ResponseBuilder.createResponse({ data: verification });
  }
}
