import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core';
import { DatabaseModule } from './database/database.module';
import { MarketModule } from './market/market.module';

@Module({
  imports: [
    DatabaseModule.forRoot(),
    CoreModule.forRoot(),
    MarketModule,
  ],
})
export class AppModule {}
