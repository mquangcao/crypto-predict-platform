import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsArticle } from './entities/news-article.entity';
import { CryptoCompareService } from './providers/cryptocompare.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsArticle]), 
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [NewsController],
  providers: [
    NewsService,
    CryptoCompareService,
  ],
  exports: [NewsService],
})
export class NewsModule {}