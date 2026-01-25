import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    DatabaseModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
