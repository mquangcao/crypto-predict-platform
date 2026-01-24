import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '@app/common';

import { PaymentMethod } from '../interfaces';

@Entity('payment_callbacks')
@Index(['paymentId'])
@Index(['processed'])
@Index(['createdAt'])
export class PaymentCallbackEntity extends BaseEntity {
  @Column({ name: 'payment_id' })
  paymentId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ name: 'raw_data', type: 'json' })
  rawData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  signature?: string;

  @Column({ default: false })
  processed: boolean;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'text', nullable: true })
  error?: string;
}
