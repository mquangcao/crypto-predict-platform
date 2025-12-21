import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CryptoCompareService } from './cryptocompare.service';
import { NewsRepository } from './news.repository';
import { NewsItemDto } from './dto/news.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NewsService implements OnModuleInit {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly cryptoCompareService: CryptoCompareService,
    private readonly newsRepository: NewsRepository,
  ) {}

  async onModuleInit() {
    // Fetch ngay khi khởi động
    this.logger.log('Fetching initial news...');
    await this.fetchAndSaveNews();
  }

  @Cron('0 */30 * * * *') // Mỗi 30 phút
  async scheduledFetchNews() {
    this.logger.log('Scheduled fetch news triggered');
    await this.fetchAndSaveNews();
  }

  private async fetchAndSaveNews() {
    try {
      // Fetch news từ CryptoCompare (scrape hoặc API)
      const news = await this.cryptoCompareService.getNews('EN');
      
      // Lưu vào database
      await this.newsRepository.saveNews(news, 'cryptocompare');
      
      this.logger.log(`Successfully fetched and saved ${news.length} news items`);
    } catch (error) {
      this.logger.error('Error in fetchAndSaveNews:', error.message);
    }
  }

  async getLatestNews(page: number = 1, limit: number = 10): Promise<{ data: NewsItemDto[], total: number, page: number, totalPages: number }> {
    return this.newsRepository.getNewsPaginated(page, limit);
  }

  async getNewsBySentiment(sentiment: 'positive' | 'negative' | 'neutral', page: number = 1, limit: number = 10) {
    // Map từ frontend format sang DB format
    const dbSentiment = sentiment === 'positive' ? 'bullish' : 
                        sentiment === 'negative' ? 'bearish' : 'neutral';
    return this.newsRepository.getNewsBySentimentPaginated(dbSentiment, page, limit);
  }
}
