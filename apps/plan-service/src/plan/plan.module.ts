import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './entities/plan.entity';
import { PlanService } from './services/plan.service';
import { PlanController } from './controllers/plan.controller';
import { PlanSeeder } from './seeds/plan.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity])],
  controllers: [PlanController],
  providers: [PlanService, PlanSeeder],
  exports: [TypeOrmModule, PlanService],
})
export class PlanModule {}
