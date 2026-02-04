import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetSymbolsCommand } from '../impl/get-symbols.command';
import { MarketService } from '../../services/market.service';

@CommandHandler(GetSymbolsCommand)
export class GetSymbolsHandler implements ICommandHandler<GetSymbolsCommand> {
  constructor(private readonly marketService: MarketService) {}

  async execute(command: GetSymbolsCommand) {
    return this.marketService.getSymbols();
  }
}
