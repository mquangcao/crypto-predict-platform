import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetCurrentPriceCommand } from '../impl/get-current-price.command';
import { MarketService } from '../../services/market.service';

@CommandHandler(GetCurrentPriceCommand)
export class GetCurrentPriceHandler implements ICommandHandler<GetCurrentPriceCommand> {
  constructor(private readonly marketService: MarketService) {}

  async execute(command: GetCurrentPriceCommand) {
    const { symbol } = command;
    return this.marketService.getCurrentPrice(symbol);
  }
}
