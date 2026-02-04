import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayModule } from '@app/core';

import { PriceCandle } from './entities/price-candle.entity';
import { MarketService } from './services/market.service';
import { CandleStorageService } from './services/candle-storage.service';
import { MarketController } from './controllers/market.controller';
import { BinanceStreamService } from './services/binance-stream.service';
import { PriceStreamGateway } from './gateways/price-stream.gateway';
import { CommandHandlers } from './commands/handlers';
import { OperationsMap } from './commands/impl';

@Module({
  imports: [
    CqrsModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([PriceCandle]),
    GatewayModule.forFeature(OperationsMap),
  ],
  controllers: [MarketController],
  providers: [
    MarketService,
    BinanceStreamService,
    CandleStorageService,
    PriceStreamGateway,
    ...CommandHandlers,
  ],
  exports: [MarketService, BinanceStreamService, CandleStorageService],
})
export class MarketModule {}
