import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '@app/common';

import { PaymentStatus } from '../interfaces';

export enum PaymentActionType {
  INITIATED = 'INITIATED',
  VERIFIED = 'VERIFIED',
  CALLBACK_RECEIVED = 'CALLBACK_RECEIVED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

@Entity('payment_logs')
@Index(['paymentId'])
@Index(['createdAt'])
export class PaymentLogEntity extends BaseEntity {
  @Column({ name: 'payment_id' })
  paymentId: string;

  @Column({
    type: 'enum',
    enum: PaymentActionType,
  })
  action: PaymentActionType;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: PaymentStatus,
    nullable: true,
  })
  previousStatus?: PaymentStatus;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: PaymentStatus,
  })
  newStatus: PaymentStatus;

  @Column({ type: 'json', nullable: true })
  data?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  message?: string;
}
