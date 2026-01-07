import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TriggerCrawlCommand } from '../impl/trigger-crawl.command';
import { NewsService } from '../../services/news.service';

@CommandHandler(TriggerCrawlCommand)
export class TriggerCrawlHandler implements ICommandHandler<TriggerCrawlCommand> {
  constructor(private readonly newsService: NewsService) {}

  async execute(command: TriggerCrawlCommand) {
    await this.newsService.handleCron();
    return { success: true, message: 'News crawl triggered' };
  }
}
