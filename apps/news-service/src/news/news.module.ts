import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { GatewayModule } from '@app/core';

import { NewsController } from './controllers/news.controller';
import { NewsService } from './services/news.service';
import { ImpactSchedulerService } from './services/impact-scheduler.service';
import { SentimentQueueService } from './services/sentiment-queue.service';
import { AiHtmlParserService } from './services/ai-html-parser.service';
import { NewsArticle } from './entities/news-article.entity';
import { HtmlPattern } from './entities/html-pattern.entity';
import { CryptoCompareService } from './providers/cryptocompare.service';
import { CoinDeskCrawlerService } from './providers/coindesk-crawler.service';
import { CoinTelegraphCrawlerService } from './providers/cointelegraph-crawler.service';
import { DecryptCrawlerService } from './providers/decrypt-crawler.service';
import { TheBlockCrawlerService } from './providers/theblock-crawler.service';
import { BitcoinComCrawlerService } from './providers/bitcoin-com-crawler.service';
import { 
  AwsSchedulerClientProvider,
  AwsSqsClientProvider 
} from './providers/aws-clients.provider';
import {
  GetLatestNewsHandler,
  GetNewsBySymbolHandler,
  TriggerCrawlHandler,
} from './commands/handlers';
import { OperationsMap } from './commands/impl';

const CommandHandlers = [
  GetLatestNewsHandler,
  GetNewsBySymbolHandler,
  TriggerCrawlHandler,
];

// Factory để tạo danh sách crawlers
const newsCrawlersProvider = {
  provide: 'NEWS_CRAWLERS',
  useFactory: (
    aiParser: AiHtmlParserService,
  ) => {
    return [
      new CoinDeskCrawlerService(aiParser),
      new CoinTelegraphCrawlerService(aiParser),
      new DecryptCrawlerService(aiParser),
      new TheBlockCrawlerService(aiParser),
      new BitcoinComCrawlerService(aiParser),
    ];
  },
  inject: [AiHtmlParserService],
};

@Module({
  imports: [
    CqrsModule,
    GatewayModule.forFeature(OperationsMap),
    TypeOrmModule.forFeature([NewsArticle, HtmlPattern]),
    HttpModule,
  ],
  controllers: [NewsController],
  providers: [
    AwsSchedulerClientProvider,
    AwsSqsClientProvider,
    NewsService, 
    ImpactSchedulerService,
    SentimentQueueService,
    AiHtmlParserService,
    CryptoCompareService,
    newsCrawlersProvider,
    ...CommandHandlers
  ],
  exports: [NewsService],
})
export class NewsModule {}