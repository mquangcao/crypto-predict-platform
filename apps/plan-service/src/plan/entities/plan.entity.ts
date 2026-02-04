import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity({
  name: 'plans',
})
export class PlanEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  features: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  yearlyPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyDiscountPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  yearlyDiscountPrice: number;

  @Column({ default: false })
  isPopular: boolean;

  @Column({ nullable: true })
  tag: string;

  @Column({ default: 'Get Started' })
  cta: string;

  @Column({ nullable: true })
  href: string;

  @Column({ default: true })
  isActive: boolean;
}
