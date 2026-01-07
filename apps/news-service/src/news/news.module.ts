import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { GatewayModule } from '@app/core';

import { NewsController } from './controllers/news.controller';
import { NewsService } from './services/news.service';
import { NewsArticle } from './entities/news-article.entity';
import { CryptoCompareService } from './providers/cryptocompare.service';
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

@Module({
  imports: [
    CqrsModule,
    GatewayModule.forFeature(OperationsMap),
    TypeOrmModule.forFeature([NewsArticle]),
    HttpModule,
  ],
  controllers: [NewsController],
  providers: [NewsService, CryptoCompareService, ...CommandHandlers],
  exports: [NewsService],
})
export class NewsModule {}