import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentMethod } from '../interfaces';

export class InitiatePaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.MOMO,
    description: 'Payment method to use',
  })
  @Expose()
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({
    example: 'plan_123',
    description: 'The ID of the plan to subscribe/upgrade to',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    enum: ['month', 'year'],
    example: 'month',
    description: 'Billing interval',
  })
  @Expose()
  @IsEnum(['month', 'year'])
  @IsNotEmpty()
  interval: 'month' | 'year';

  @ApiPropertyOptional({
    example: 'Payment for Premium Plan',
    description: 'Payment description',
  })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'http://localhost:3000/payment/success',
    description: 'URL to redirect after payment (required)',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  redirectUrl: string;

  @ApiPropertyOptional({
    example: {
      name: 'Nguyen Van A',
      email: 'nguyen.a@example.com',
      phone: '0901234567',
    },
    description: 'Customer information',
  })
  @Expose()
  @IsObject()
  @IsOptional()
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  @ApiPropertyOptional({
    example: { promoCode: 'SUMMER2024' },
    description: 'Additional metadata',
  })
  @Expose()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
