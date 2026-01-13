import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core';
import { MarketModule } from './market/market.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    MarketModule,
  ],
})
export class AppModule {}
