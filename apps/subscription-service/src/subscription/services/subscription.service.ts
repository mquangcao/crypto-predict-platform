import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
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
    // Prioritize the one that is currently active (source of truth for current plan)
    // but we check for any plan that covers "now" or ends in the future
    return this.subscriptionRepo.createQueryBuilder('sub')
      .where('sub.userId = :userId', { userId })
      .andWhere('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('sub.endDate > :now', { now })
      .orderBy('sub.startDate', 'ASC') // Get the one that started earliest but is still valid
      .getOne();
  }

  async createOrExtendSubscription(data: {
    userId: string;
    planId: string;
    planName: string;
    interval: 'month' | 'year';
    metadata?: any;
  }) {
    // 1. Find the latest active subscription for ANY plan to see if we should extend or start new
    const currentActive = await this.findActiveSubscription(data.userId);
    
    let startDate = new Date();
    let subscriptionToUpdate: SubscriptionEntity | null = null;

    if (currentActive) {
      if (currentActive.planId === data.planId) {
        // SAME PLAN: Extend the existing record
        subscriptionToUpdate = currentActive;
        startDate = new Date(currentActive.endDate);
      } else {
        // DIFFERENT PLAN: (Optional) Logic for upgrade/downgrade could go here
        // For now, we'll start a new one from now (simple overlap or replacement logic)
        startDate = new Date();
      }
    }

    const endDate = new Date(startDate);
    if (data.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    if (subscriptionToUpdate) {
      subscriptionToUpdate.endDate = endDate;
      subscriptionToUpdate.metadata = {
        ...subscriptionToUpdate.metadata,
        ...data.metadata,
        extendedAt: new Date(),
        lastTransactionId: data.metadata?.transactionId,
      };
      return this.subscriptionRepo.save(subscriptionToUpdate);
    }

    const subscription = this.subscriptionRepo.create({
      userId: data.userId,
      planId: data.planId,
      planName: data.planName,
      startDate: new Date(), // Start new one from now
      endDate,
      status: SubscriptionStatus.ACTIVE,
      metadata: data.metadata,
    });

    return this.subscriptionRepo.save(subscription);
  }
}
