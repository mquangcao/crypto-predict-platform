import { GatewayModule } from '@app/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandHandlers } from './commands/handlers';
import { OperationMap } from './commands/impl';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity]),
    GatewayModule.forFeature(OperationMap),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, ...CommandHandlers],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
