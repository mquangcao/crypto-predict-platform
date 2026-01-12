import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GetLatestNewsCommand } from '../impl/get-latest-news.command';
import { NewsService } from '../../services/news.service';

@CommandHandler(GetLatestNewsCommand)
export class GetLatestNewsHandler implements ICommandHandler<GetLatestNewsCommand> {
  constructor(private readonly newsService: NewsService) {}

  async execute(command: GetLatestNewsCommand) {
    return this.newsService.findAll(command.limit);
  }
}
