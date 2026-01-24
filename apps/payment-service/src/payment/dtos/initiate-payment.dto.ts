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
    example: 'ORD-123456',
    description: 'Order ID for the payment',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    example: 150000,
    description: 'Payment amount',
    minimum: 0,
  })
  @Expose()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    example: 'VND',
    description: 'Currency code',
  })
  @Expose()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    example: 'Payment for order #123456',
    description: 'Payment description',
  })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/payment/success',
    description: 'URL to redirect after payment (required for Momo, Bank Transfer)',
  })
  @Expose()
  @IsString()
  @IsOptional()
  redirectUrl?: string;

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
    example: { tableNumber: 5, waiterName: 'John' },
    description: 'Additional metadata',
  })
  @Expose()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
