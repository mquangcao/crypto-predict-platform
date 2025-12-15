import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NewsItemDto } from './dto/news.dto';

@Injectable()
export class CryptoCompareService {
  private readonly logger = new Logger(CryptoCompareService.name);
  private readonly apiKey = 'bf2d8615fdcba7687b1926b118d2c93f2e5ce4e382e20e0fc5682b8af7add0b5';
  private readonly baseUrl = 'https://min-api.cryptocompare.com/data/v2/news/';

  constructor(private readonly httpService: HttpService) {}

  async getNews(lang: string = 'EN'): Promise<any[]> {
    try {
      const url = `${this.baseUrl}?lang=${lang}`;
      this.logger.log(`Fetching from CryptoCompare: ${url}`);
      
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

      this.logger.log(`CryptoCompare response type: ${response.data?.Type}`);
      
      if (response.data && response.data.Data && Array.isArray(response.data.Data)) {
        this.logger.log(`Successfully fetched ${response.data.Data.length} news from CryptoCompare`);
        return this.transformNews(response.data.Data);
      }

      this.logger.warn(`CryptoCompare API response does not contain Data array. Response: ${JSON.stringify(response.data)}`);
      return [];
    } catch (error) {
      this.logger.error('Error fetching news from CryptoCompare:', error.response?.data || error.message);
      throw error;
    }
  }

  private transformNews(rawNews: any[]): any[] {
    return rawNews.slice(0, 20).map((news) => {
      // Tính toán sentiment dựa trên title và votes
      const sentiment = this.determineSentiment(
        news.upvotes,
        news.downvotes,
        news.title,
        news.body,
        news.categories
      );
      
      const timeAgo = this.getTimeAgo(news.published_on);

      return {
        id: news.id,
        title: news.title,
        source: news.source_info?.name || news.source || 'CryptoCompare',
        time: timeAgo,
        sentiment: sentiment,
        url: news.url,
        published_at: new Date(news.published_on * 1000).toISOString(),
        upvotes: parseInt(news.upvotes?.toString() || '0'),
        downvotes: parseInt(news.downvotes?.toString() || '0'),
        body: news.body || '',
        description: news.body || '',
        categories: news.categories || '',
      };
    });
  }

  private determineSentiment(
    upvotes: string | number,
    downvotes: string | number,
    title: string,
    body: string,
    categories: string
  ): string {
    const up = parseInt(upvotes?.toString() || '0');
    const down = parseInt(downvotes?.toString() || '0');
    
    // Keyword analysis
    const bullishKeywords = [
      'surge', 'rally', 'bullish', 'gains', 'rise', 'soar', 'jump', 
      'pump', 'moon', 'breakthrough', 'adoption', 'partnership', 
      'upgrade', 'optimism', 'positive', 'recovery', 'green',
      'tăng', 'tích cực', 'xanh'
    ];
    
    const bearishKeywords = [
      'crash', 'dump', 'bearish', 'fall', 'drop', 'decline', 'loss',
      'plunge', 'concern', 'fear', 'warning', 'risk', 'scam', 
      'hack', 'exploit', 'lawsuit', 'regulation', 'ban',
      'giảm', 'tiêu cực', 'đỏ', 'rủi ro'
    ];

    const text = `${title} ${body} ${categories}`.toLowerCase();
    
    let sentimentScore = 0;
    
    // Check keywords
    bullishKeywords.forEach(keyword => {
      if (text.includes(keyword)) sentimentScore += 1;
    });
    
    bearishKeywords.forEach(keyword => {
      if (text.includes(keyword)) sentimentScore -= 1;
    });

    // Votes analysis
    const totalVotes = up + down;
    if (totalVotes > 0) {
      const voteRatio = up / totalVotes;
      if (voteRatio > 0.7) sentimentScore += 2;
      else if (voteRatio < 0.3) sentimentScore -= 2;
    }

    // Final decision
    if (sentimentScore > 1) return 'bullish';
    if (sentimentScore < -1) return 'bearish';
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
