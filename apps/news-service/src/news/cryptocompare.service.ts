import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CryptoCompareScraperService } from './cryptocompare-scraper.service';

@Injectable()
export class CryptoCompareService {
  private readonly logger = new Logger(CryptoCompareService.name);
  private readonly apiKey = 'bf2d8615fdcba7687b1926b118d2c93f2e5ce4e382e20e0fc5682b8af7add0b5';
  private readonly baseUrl = 'https://min-api.cryptocompare.com/data/v2/news/';

  constructor(
    private readonly httpService: HttpService,
    private readonly scraperService: CryptoCompareScraperService,
  ) {}

  async getNews(lang: string = 'EN'): Promise<any[]> {
    // Srape trước
    try {
      this.logger.log('Attempting to scrape news from CryptoCompare website...');
      const scrapedNews = await this.scraperService.scrapeNews();
      
      if (scrapedNews && scrapedNews.length > 0) {
        this.logger.log(`Successfully scraped ${scrapedNews.length} news from website`);
        return this.transformScrapedNews(scrapedNews);
      }
    } catch (error) {
      this.logger.warn(`Scraping failed: ${error.message}, falling back to API`);
    }

    // Fallback về API nếu scraping thất bại hoặc không có dữ liệu
    return this.getNewsFromApi(lang);
  }

  private async getNewsFromApi(lang: string = 'EN'): Promise<any[]> {
    try {
      const url = `${this.baseUrl}?lang=${lang}`;
      this.logger.log(`Fetching from CryptoCompare API: ${url}`);
      
      const response = await firstValueFrom(
        this.httpService.get<{ Type: number; Message: string; Data: any[] }>(
          url,
          {
            headers: {
              'authorization': `Apikey ${this.apiKey}`,
            },
          }
        )
      );

      this.logger.log(`CryptoCompare API response type: ${response.data?.Type}`);
      
      if (response.data && response.data.Data && Array.isArray(response.data.Data)) {
        this.logger.log(`Successfully fetched ${response.data.Data.length} news from API`);
        return this.transformApiNews(response.data.Data);
      }

      this.logger.warn(`CryptoCompare API response does not contain Data array`);
      return [];
    } catch (error) {
      this.logger.error('Error fetching news from CryptoCompare API:', error.response?.data || error.message);
      throw error;
    }
  }

  private transformScrapedNews(scrapedNews: any[]): any[] {
    return scrapedNews.map((news) => {
      const timeAgo = this.getTimeAgo(new Date(news.published_at).getTime() / 1000);

      // Tính sentiment nếu không có sẵn từ website
      let sentiment = news.sentiment;
      if (!sentiment) {
        sentiment = this.calculateSentiment(news.title, news.body || '');
      }

      return {
        id: news.id,
        title: news.title,
        source: news.source,
        time: timeAgo,
        sentiment: sentiment || 'neutral',
        url: news.url,
        published_at: news.published_at,
        body: news.body || '',
        description: news.body || '',
        categories: news.categories || '',
        sentiment_from_source: news.sentiment, // Lưu sentiment từ nguồn
      };
    });
  }

  private transformApiNews(rawNews: any[]): any[] {
    return rawNews.slice(0, 20).map((news) => {
      const timeAgo = this.getTimeAgo(news.published_on);

      // Tính sentiment từ title và body
      const sentiment = this.calculateSentiment(news.title, news.body || '');

      return {
        id: news.id,
        title: news.title,
        source: news.source_info?.name || news.source || 'CryptoCompare',
        time: timeAgo,
        sentiment: sentiment,
        url: news.url,
        published_at: new Date(news.published_on * 1000).toISOString(),
        body: news.body || '',
        description: news.body || '',
        categories: news.categories || '',
        sentiment_from_source: undefined, // API không cung cấp sentiment
      };
    });
  }

  private calculateSentiment(title: string, body: string): string {
    // Keyword analysis cho việc tính sentiment chỉ để hiển thị UI
    const bullishKeywords = [
      'surge', 'rally', 'bullish', 'gains', 'rise', 'soar', 'jump', 
      'pump', 'moon', 'breakthrough', 'adoption', 'partnership', 
      'upgrade', 'optimism', 'positive', 'recovery', 'green',
      'tăng', 'tích cực', 'xanh', 'all-time high', 'ath', 'breakout'
    ];
    
    const bearishKeywords = [
      'crash', 'dump', 'bearish', 'fall', 'drop', 'decline', 'loss',
      'plunge', 'concern', 'fear', 'warning', 'risk', 'scam', 
      'hack', 'exploit', 'lawsuit', 'regulation', 'ban',
      'giảm', 'tiêu cực', 'đỏ', 'rủi ro', 'fraud', 'collapse'
    ];

    const text = `${title} ${body}`.toLowerCase();
    
    let sentimentScore = 0;
    
    bullishKeywords.forEach(keyword => {
      if (text.includes(keyword)) sentimentScore += 1;
    });
    
    bearishKeywords.forEach(keyword => {
      if (text.includes(keyword)) sentimentScore -= 1;
    });

    if (sentimentScore > 0) return 'bullish';
    if (sentimentScore < 0) return 'bearish';
    return 'neutral';
  }

  private getTimeAgo(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diffSecs = now - timestamp;
    const diffMins = Math.floor(diffSecs / 60);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  }
}
