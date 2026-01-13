import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GatewayModule } from '@app/core';

import { MarketService } from './services/market.service';
import { MarketController } from './controllers/market.controller';
import { BinanceStreamService } from './services/binance-stream.service';
import { PriceStreamGateway } from './gateways/price-stream.gateway';
import { CommandHandlers } from './commands/handlers';
import { OperationsMap } from './commands/impl';

@Module({
  imports: [
    CqrsModule,
    GatewayModule.forFeature(OperationsMap),
  ],
  controllers: [MarketController],
  providers: [
    MarketService,
    BinanceStreamService,
    PriceStreamGateway,
    ...CommandHandlers,
  ],
  exports: [MarketService, BinanceStreamService],
})
export class MarketModule {}
