import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CryptoCompareService } from './cryptocompare.service';
import { CryptoCompareScraperService } from './cryptocompare-scraper.service';
import { NewsRepository } from './news.repository';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsEntity } from './entities/news.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([NewsEntity]),
  ],
  controllers: [NewsController],
  providers: [
    NewsService, 
    CryptoCompareService,
    CryptoCompareScraperService,
    NewsRepository,
  ],
  exports: [NewsService],
})
export class NewsModule {}
