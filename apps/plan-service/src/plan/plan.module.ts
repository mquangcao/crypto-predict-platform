import { GatewayModule } from '@app/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './entities/plan.entity';
import { PlanService } from './services/plan.service';
import { PlanController } from './controllers/plan.controller';
import { PlanSeeder } from './seeds/plan.seeder';
import { CommandHandlers } from './commands/handlers';
import { OperationMap } from './commands/impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanEntity]),
    GatewayModule.forFeature(OperationMap),
  ],
  controllers: [PlanController],
  providers: [PlanService, PlanSeeder, ...CommandHandlers],
  exports: [TypeOrmModule, PlanService],
})
export class PlanModule {}
