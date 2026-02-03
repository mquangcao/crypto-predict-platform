import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCandlesCommand } from '../impl/get-candles.command';
import { MarketService } from '../../services/market.service';
import { CandleStorageService } from '../../services/candle-storage.service';
import { Timeframe } from '../../interfaces/market-service.interface';

@CommandHandler(GetCandlesCommand)
export class GetCandlesHandler implements ICommandHandler<GetCandlesCommand> {
  constructor(
    private readonly marketService: MarketService,
    @Inject(CandleStorageService)
    private readonly candleStorageService: CandleStorageService,
  ) {}

  async execute(command: GetCandlesCommand) {
    const { symbol, timeframe = '1m', limit, startTime, endTime } = command;
    
    const allowed: Timeframe[] = ['1m', '5m', '15m', '1h', '1d'];
    const tf = timeframe.toLowerCase() as Timeframe;
    
    if (!allowed.includes(tf)) {
      throw new Error(`Invalid timeframe: ${tf}. Allowed: ${allowed.join(', ')}`);
    }

    // Nếu có startTime/endTime, query từ TimescaleDB
    if (startTime && endTime) {
      return this.candleStorageService.getCandles(
        symbol,
        tf as any,
        new Date(startTime),
        new Date(endTime),
      );
    }

    // Nếu không, fetch từ Binance API (backward compatibility)
    return this.marketService.getCandles(symbol, tf, limit || 200);
  }
}
