import { NEWS_OPERATION } from '@app/common';

import { GetLatestNewsCommand } from './get-latest-news.command';
import { GetNewsBySymbolCommand } from './get-news-by-symbol.command';
import { TriggerCrawlCommand } from './trigger-crawl.command';

export const OperationsMap = {
  [NEWS_OPERATION.GET_LATEST_NEWS]: GetLatestNewsCommand,
  [NEWS_OPERATION.GET_NEWS_BY_SYMBOL]: GetNewsBySymbolCommand,
  [NEWS_OPERATION.TRIGGER_CRAWL]: TriggerCrawlCommand,
};

export { GetLatestNewsCommand, GetNewsBySymbolCommand, TriggerCrawlCommand };
