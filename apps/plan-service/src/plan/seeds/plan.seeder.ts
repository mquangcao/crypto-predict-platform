import { Injectable, OnModuleInit } from '@nestjs/common';
import { PlanService } from '../services/plan.service';

@Injectable()
export class PlanSeeder implements OnModuleInit {
  constructor(private readonly planService: PlanService) {}

  async onModuleInit() {
    const existingPlans = await this.planService.findAll();
    
    // Only seed if no plans exist
    if (existingPlans.length === 0) {
      await this.seedPlans();
    }
  }

  private async seedPlans() {
    const MONTHLY_PRICE = 36000;
    const YEARLY_DISCOUNT_PERCENT = 20; // 20% discount for yearly
    
    const plans = [
      {
        name: 'Standard',
        description: 'Foundational tools for market exploration.',
        features: [
          'Real-time technical charts',
          'Market news aggregator',
          'Standard data latency',
          'Email support',
        ],
        monthlyPrice: 0,
        yearlyPrice: 0,
        isPopular: false,
        cta: 'Get Started',
        href: '/',
      },
      {
        name: 'VIP Premium',
        description: 'Advanced intelligence for professional edge.',
        features: [
          'Proprietary AI model analysis',
          'Actionable trade signals',
          'Advanced technical indicators',
          'Real-time price alerts',
          'Weekly market intelligence reports',
          'Zero-ads experience',
        ],
        monthlyPrice: MONTHLY_PRICE,
        yearlyPrice: MONTHLY_PRICE * 12, // 432,000 VND
        yearlyDiscountPrice: MONTHLY_PRICE * 12 * (1 - YEARLY_DISCOUNT_PERCENT / 100), // 345,600 VND (20% off)
        isPopular: true,
        tag: 'Recommended',
        cta: 'Go Premium',
        href: '/checkout',
      },
    ];

    for (const plan of plans) {
      await this.planService.create(plan);
      console.log(`✅ Seeded plan: ${plan.name}`);
    }

    console.log('🎉 Plan seeding completed!');
  }
}
