import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GetNewsBySymbolCommand } from '../impl/get-news-by-symbol.command';
import { NewsService } from '../../services/news.service';

@CommandHandler(GetNewsBySymbolCommand)
export class GetNewsBySymbolHandler implements ICommandHandler<GetNewsBySymbolCommand> {
  constructor(private readonly newsService: NewsService) {}

  async execute(command: GetNewsBySymbolCommand) {
    return this.newsService.findBySymbol(command.symbol);
  }
}
