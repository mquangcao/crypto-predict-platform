import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NewsItemDto } from './dto/news.dto';
import { CryptoCompareService } from './cryptocompare.service';
import { NewsRepository } from './news.repository';
import { CoinPriceService } from './coin-price.service';

@Injectable()
export class CryptoPanicService {
  private readonly logger = new Logger(CryptoPanicService.name);
  private readonly apiKey = '5517225cddfb06cb2a0c4938a5839815cbd387b0';
  private readonly baseUrl = 'https://cryptopanic.com/api/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly cryptoCompareService: CryptoCompareService,
    private readonly newsRepository: NewsRepository,
    private readonly coinPriceService: CoinPriceService,
  ) {}

  async getNews(filter: string = 'hot', currencies?: string): Promise<NewsItemDto[]> {
    try {
      // Kiểm tra database trước (lấy news trong 30 phút gần nhất)
      const dbNews = await this.newsRepository.getRecentNews(30);
      if (dbNews && dbNews.length > 0) {
        this.logger.log(`Found ${dbNews.length} news items from database`);
        return dbNews;
      }

      this.logger.log('No recent news in database, fetching from API...');

      const params: any = {
        auth_token: this.apiKey,
        public: 'true',
        filter: filter,
      };

      if (currencies) {
        params.currencies = currencies;
      }

      const response = await firstValueFrom(
        this.httpService.get<{ count: number; next: string | null; previous: string | null; results: any[] }>(`${this.baseUrl}/posts/`, { params })
      );

      // API trả về object có cấu trúc { count, next, previous, results }
      if (response.data && Array.isArray(response.data.results)) {
        const transformedNews = this.transformNews(response.data.results);
        
        // Lấy giá coin hiện tại
        const coinPrices = await this.coinPriceService.getCurrentPrices();
        
        // Lưu vào database
        await this.newsRepository.saveNews(transformedNews, 'cryptopanic', coinPrices);
        this.logger.log(`Saved ${transformedNews.length} news to database`);
        
        return transformedNews;
      }
      
      this.logger.warn('API response does not contain results array');
      return [];
    } catch (error) {
      this.logger.error('Error fetching news from CryptoPanic:', error.message);
      
      // Nếu lỗi, thử lấy từ database (tin cũ hơn 30 phút)
      const oldDbNews = await this.newsRepository.getRecentNews(120); // 2 giờ
      if (oldDbNews && oldDbNews.length > 0) {
        this.logger.log('Returning old news from database due to API error');
        return oldDbNews;
      }
      
      // Thử CryptoCompare API
      try {
        this.logger.warn('CryptoPanic API failed, trying CryptoCompare as fallback...');
        const fallbackNews = await this.cryptoCompareService.getNews();
        
        if (fallbackNews.length > 0) {
          // Lấy giá coin và lưu vào database
          const coinPrices = await this.coinPriceService.getCurrentPrices();
          await this.newsRepository.saveNews(fallbackNews, 'cryptocompare', coinPrices);
          return fallbackNews;
        }
      } catch (fallbackError) {
        this.logger.error('CryptoCompare fallback also failed:', fallbackError.message);
      }
      
      // Cuối cùng mới trả về mock data
      this.logger.warn('All APIs and database failed, returning static fallback data');
      return this.getFallbackNews();
    }
  }

  private getFallbackNews(): NewsItemDto[] {
    return [
      {
        id: 'fallback-1',
        title: 'Bitcoin maintains strong support above $40,000',
        source: 'CryptoNews',
        time: '1 giờ trước',
        sentiment: 'bullish',
        url: 'https://cryptopanic.com',
        published_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'fallback-2',
        title: 'Ethereum network upgrade scheduled for Q1 2026',
        source: 'CoinDesk',
        time: '2 giờ trước',
        sentiment: 'bullish',
        url: 'https://cryptopanic.com',
        published_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'fallback-3',
        title: 'Market volatility expected amid regulatory discussions',
        source: 'CryptoDaily',
        time: '3 giờ trước',
        sentiment: 'neutral',
        url: 'https://cryptopanic.com',
        published_at: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 'fallback-4',
        title: 'Major exchange reports increased trading volume',
        source: 'Binance News',
        time: '4 giờ trước',
        sentiment: 'bullish',
        url: 'https://cryptopanic.com',
        published_at: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'fallback-5',
        title: 'Altcoin season indicators show mixed signals',
        source: 'CryptoWatch',
        time: '5 giờ trước',
        sentiment: 'neutral',
        url: 'https://cryptopanic.com',
        published_at: new Date(Date.now() - 18000000).toISOString(),
      },
    ];
  }

  private transformNews(rawNews: any[]): any[] {
    return rawNews.map((news) => {
      // Sử dụng metadata sentiment nếu có, nếu không thì tính toán
      let sentiment = 'neutral';
      
      // CryptoPanic API có metadata trong news
      if (news.metadata) {
        if (news.metadata.bullish) sentiment = 'bullish';
        else if (news.metadata.bearish) sentiment = 'bearish';
      }
      
      // Nếu không có metadata, tính dựa trên votes và kind
      if (sentiment === 'neutral') {
        sentiment = this.determineSentiment(news.votes, news.kind, news.title);
      }
      
      const timeAgo = this.getTimeAgo(news.published_at);

      return {
        id: news.id.toString(),
        title: news.title,
        source: news.source?.title || news.domain || 'Crypto News',
        time: timeAgo,
        sentiment: sentiment,
        url: news.url,
        published_at: news.published_at,
        votes: news.votes,
        body: news.body || '',
        description: news.body || '',
        categories: news.currencies?.map((c: any) => c.code).join(',') || '',
      };
    });
  }

  private determineSentiment(votes: any, kind?: string, title?: string): string {
    // Phân tích tiêu đề trước
    if (title) {
      const titleLower = title.toLowerCase();
      
      // Từ khóa bearish rất mạnh
      const veryStrongBearish = ['crash', 'dump', 'collapse', 'scam', 'hack', 'fraud', 'ban', 'rejects', 'reject'];
      if (veryStrongBearish.some(word => titleLower.includes(word))) {
        return 'bearish';
      }
      
      // Cụm từ bearish đặc biệt
      const bearishPhrases = ['takes aim at', 'takes aim', 'against', 'criticize', 'slams', 'dismiss'];
      if (bearishPhrases.some(phrase => titleLower.includes(phrase))) {
        return 'bearish';
      }
      
      // Từ khóa bullish mạnh
      const strongBullish = ['surge', 'rally', 'boom', 'soar', 'moon', 'breakthrough', 'record high', 'all-time high'];
      if (strongBullish.some(word => titleLower.includes(word))) {
        return 'bullish';
      }
      
      // Từ khóa bearish yếu
      const weakBearish = ['fall', 'drop', 'decline', 'concern', 'fear', 'risk', 'pressure', 'struggle', 'plunge', 'failed', 'fails'];
      const bearishCount = weakBearish.filter(word => titleLower.includes(word)).length;
      
      // Từ khóa bullish yếu  
      const weakBullish = ['rise', 'gain', 'growth', 'positive', 'optimism', 'recovery', 'support', 'strong'];
      const bullishCount = weakBullish.filter(word => titleLower.includes(word)).length;
      
      if (bearishCount > bullishCount && bearishCount >= 1) return 'bearish';
      if (bullishCount > bearishCount && bullishCount >= 2) return 'bullish';
    }
    
    // Nếu không rõ từ tiêu đề, dùng votes
    if (!votes) return 'neutral';

    const liked = votes.liked || 0;
    const disliked = votes.disliked || 0;
    const important = votes.important || 0;
    
    // Important votes cao -> tin quan trọng, thường tích cực
    if (important > 5 && liked > disliked) return 'bullish';
    
    const total = liked + disliked;
    
    // Ít votes, dùng kind
    if (total < 3) {
      if (kind === 'media') return 'neutral';
      if (disliked > liked) return 'bearish';
      if (liked > disliked) return 'bullish';
      return 'neutral';
    }

    const ratio = liked / total;

    // Ngưỡng thấp hơn để nhạy cảm hơn
    if (ratio > 0.6) return 'bullish';
    if (ratio < 0.4) return 'bearish';
    return 'neutral';
  }

  private getTimeAgo(publishedAt: string): string {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  }
}
