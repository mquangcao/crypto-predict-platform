import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    DatabaseModule,
    PaymentModule.forRoot(),
  ],
})
export class AppModule {}
