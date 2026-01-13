import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetCandlesCommand } from '../impl/get-candles.command';
import { MarketService } from '../../services/market.service';
import { Timeframe } from '../../interfaces/market-service.interface';

@CommandHandler(GetCandlesCommand)
export class GetCandlesHandler implements ICommandHandler<GetCandlesCommand> {
  constructor(private readonly marketService: MarketService) {}

  async execute(command: GetCandlesCommand) {
    const { symbol, timeframe = '1m', limit = 200 } = command;
    
    const allowed: Timeframe[] = ['1m', '5m', '1h', '1d'];
    const tf = timeframe.toLowerCase() as Timeframe;
    
    if (!allowed.includes(tf)) {
      throw new Error(`Invalid timeframe: ${tf}. Allowed: ${allowed.join(', ')}`);
    }

    return this.marketService.getCandles(symbol, tf, limit);
  }
}
