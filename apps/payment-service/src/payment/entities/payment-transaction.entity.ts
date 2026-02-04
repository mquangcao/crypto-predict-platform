import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '@app/common';

import { PaymentMethod, PaymentStatus } from '../interfaces';

@Entity('payment_transactions')
@Index(['orderId'])
@Index(['transactionId'], { unique: true })
@Index(['userId'])
export class PaymentTransactionEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'transaction_id', unique: true })
  transactionId: string;

  @Column({ name: 'payment_url', nullable: true })
  paymentUrl?: string;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  qrCode?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'customer_info', type: 'json', nullable: true })
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;
}
