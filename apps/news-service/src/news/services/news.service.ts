import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewsArticle } from '../entities/news-article.entity';
import { CryptoCompareService } from '../providers/cryptocompare.service';
import { CreateNewsDto } from '../dto/create-news.dto';
import { NewsCrawler } from '../interfaces/news-crawler.interface';
import { ImpactSchedulerService } from './impact-scheduler.service';
import { SentimentQueueService } from './sentiment-queue.service';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly crawlers: NewsCrawler[];

  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsRepo: Repository<NewsArticle>,
    private readonly cryptoCompareService: CryptoCompareService,
    private readonly impactSchedulerService: ImpactSchedulerService,
    private readonly sentimentQueueService: SentimentQueueService,
    @Inject('NEWS_CRAWLERS') crawlers: NewsCrawler[],
  ) {
    // Combine API-based crawler with web crawlers
    this.crawlers = [cryptoCompareService, ...crawlers];
  }

  // --- WORKFLOW STEP 1: CRAWL & SAVE ---

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.log('⏰ Cron Job Started: Syncing News from Multiple Sources...');
    
    // Crawl từ tất cả sources song song
    const promises = this.crawlers.map(crawler => 
      this.syncFromSource(crawler).catch(error => {
        this.logger.error(`Error syncing from ${crawler.sourceName}: ${error.message}`);
      })
    );
    
    await Promise.allSettled(promises);
    
    this.logger.log('✅ Cron Job Finished - All Sources Synced.');
  }

  async syncFromSource(crawler: NewsCrawler) {
    const articles = await crawler.fetchNews();
    if (articles.length === 0) return;

    let savedCount = 0;
    let skipCount = 0;

    for (const articleDto of articles) {
      // Check trùng lặp nhanh bằng ID (Index Scan)
      const exists = await this.newsRepo.findOne({
        where: { 
          source: articleDto.source, 
          externalId: articleDto.externalId 
        },
        select: ['id'], 
      });

      if (!exists) {
        const newArticle = this.newsRepo.create(articleDto);
        const savedArticle = await this.newsRepo.save(newArticle);
        savedCount++;

        // 🔥 TẠO LỊCH HẸN CHO EVENTBRIDGE
        try {
          await this.impactSchedulerService.scheduleAllTimeframes(
            savedArticle.id,
            savedArticle.symbols || [],
            savedArticle.publishedAt,
          );
          this.logger.log(`📅 Scheduled impact analysis for article ${savedArticle.id}`);
        } catch (error) {
          this.logger.error(`Failed to schedule impact for article ${savedArticle.id}`, error);
        }

        // 🔥 GỬI MESSAGE TỚI SENTIMENT QUEUE
        try {
          await this.sentimentQueueService.sendNewsForAnalysis(
            savedArticle.id,
            savedArticle.title,
            savedArticle.content
          );
        } catch (error) {
          this.logger.error(`Failed to send article ${savedArticle.id} to sentiment queue`, error);
        }
      } else {
        skipCount++;
      }
    }

    this.logger.log(
      `📊 [${crawler.sourceName}] Result: ${savedCount} new saved, ${skipCount} duplicates skipped.`
    );
  }

  // --- PUBLIC API METHODS ---

  async findAll(limit: number = 50) {
    return this.newsRepo.find({
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.newsRepo.findOne({ where: { id } });
  }

  async findBySymbol(symbol: string, limit: number = 50) {
    return this.newsRepo
      .createQueryBuilder('news')
      .where(':symbol = ANY(news.symbols)', { symbol: symbol.toUpperCase() })
      .orderBy('news.publishedAt', 'DESC')
      .take(limit)
      .getMany();
  }
}