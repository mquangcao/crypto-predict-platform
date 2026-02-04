import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@app/common';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity({
  name: 'subscriptions',
})
export class SubscriptionEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  planId: string;

  @Column()
  planName: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
