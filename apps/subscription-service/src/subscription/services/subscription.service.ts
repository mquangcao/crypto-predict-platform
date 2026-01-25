import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity, SubscriptionStatus } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { endDate: 'DESC' },
    });
  }

  async findActiveSubscription(userId: string): Promise<SubscriptionEntity | null> {
    const now = new Date();
    return this.subscriptionRepo.createQueryBuilder('sub')
      .where('sub.userId = :userId', { userId })
      .andWhere('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('sub.endDate > :now', { now })
      .getOne();
  }

  async createOrExtendSubscription(data: {
    userId: string;
    planId: string;
    planName: string;
    interval: 'month' | 'year';
    metadata?: any;
  }) {
    const activeSub = await this.findActiveSubscription(data.userId);
    
    let startDate = new Date();
    if (activeSub && activeSub.planId === data.planId) {
      // Extend if same plan
      startDate = new Date(activeSub.endDate);
    }

    const endDate = new Date(startDate);
    if (data.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = this.subscriptionRepo.create({
      userId: data.userId,
      planId: data.planId,
      planName: data.planName,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      metadata: data.metadata,
    });

    return this.subscriptionRepo.save(subscription);
  }
}
