import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { BinanceStreamService } from '../binance-stream.service';
import { PriceStreamGateway } from '../price-stream.gateway';

@Module({
  imports: [],
  controllers: [MarketController],
  providers: [
    MarketService,
    BinanceStreamService,  // ✅ provider cho gateway
    PriceStreamGateway,    // ✅ gateway cũng là provider
  ],
  exports: [BinanceStreamService], // optional, nhưng không hại
})
export class MarketModule {}
