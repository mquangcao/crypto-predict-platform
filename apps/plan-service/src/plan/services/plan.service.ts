import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanEntity } from '../entities/plan.entity';
import { CreatePlanDto } from '../dtos/create-plan.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';
import { DiscountPlanDto } from '../dtos/discount-plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly planRepo: Repository<PlanEntity>,
  ) {}

  async findAllActive(): Promise<PlanEntity[]> {
    return this.planRepo.find({
      where: { isActive: true },
      order: { monthlyPrice: 'ASC' },
    });
  }

  async findAll(): Promise<PlanEntity[]> {
    return this.planRepo.find({
      order: { monthlyPrice: 'ASC' },
    });
  }

  async findById(id: string): Promise<PlanEntity> {
    const plan = await this.planRepo.findOne({ where: { id } as any });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async create(dto: CreatePlanDto): Promise<PlanEntity> {
    const plan = this.planRepo.create(dto);
    return this.planRepo.save(plan);
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanEntity> {
    const plan = await this.findById(id);
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  async applyDiscount(id: string, dto: DiscountPlanDto): Promise<PlanEntity> {
    const plan = await this.findById(id);
    if (dto.monthlyDiscountPrice !== undefined) {
      plan.monthlyDiscountPrice = dto.monthlyDiscountPrice;
    }
    if (dto.yearlyDiscountPrice !== undefined) {
      plan.yearlyDiscountPrice = dto.yearlyDiscountPrice;
    }
    return this.planRepo.save(plan);
  }

  async removeDiscount(id: string): Promise<PlanEntity> {
    const plan = await this.findById(id);
    plan.monthlyDiscountPrice = null;
    plan.yearlyDiscountPrice = null;
    return this.planRepo.save(plan);
  }

  async softDelete(id: string): Promise<void> {
    const plan = await this.findById(id);
    plan.isActive = false;
    await this.planRepo.save(plan);
  }
}
