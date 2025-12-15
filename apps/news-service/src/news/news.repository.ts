import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { NewsEntity } from './entities/news.entity';
import { NewsItemDto } from './dto/news.dto';
import Sentiment = require('sentiment');

@Injectable()
export class NewsRepository {
  private readonly logger = new Logger(NewsRepository.name);
  private readonly sentimentAnalyzer = new Sentiment();

  constructor(
    @InjectRepository(NewsEntity)
    private readonly repository: Repository<NewsEntity>,
  ) {}

  async saveNews(newsItems: any[], apiSource: string, coinPrices?: Record<string, number>): Promise<void> {
    try {
      const entities = newsItems.map((item) => {
        const entity = new NewsEntity();
        entity.id = item.id;
        entity.title = item.title;
        entity.source = item.source;
        entity.url = item.url || '';
        entity.published_at = new Date(item.published_at);
        entity.body = item.body || item.description || '';
        entity.categories = item.categories || '';
        
        // Tính sentiment score và label - truyền cả body để phân tích
        const sentimentData = this.calculateAdvancedSentiment(
          item.title,
          item.body || item.description || '',
          item.votes?.liked || item.upvotes || 0,
          item.votes?.disliked || item.downvotes || 0
        );
        
        entity.sentiment_label = sentimentData.label;
        entity.sentiment_score = sentimentData.score;
        entity.api_source = apiSource;
        
        if (coinPrices) {
          entity.btc_price = coinPrices['BTC'];
          entity.eth_price = coinPrices['ETH'];
          entity.coin_prices = coinPrices;
        }

        return entity;
      });

      await this.repository.save(entities);
      this.logger.log(`Saved ${entities.length} news items to database`);
    } catch (error) {
      this.logger.error('Error saving news to database:', error.message);
    }
  }

  async getRecentNews(minutes: number = 30): Promise<NewsItemDto[]> {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      
      const entities = await this.repository.find({
        where: {
          created_at: MoreThan(cutoffTime),
        },
        order: {
          published_at: 'DESC',
        },
        take: 50,
      });

      return entities.map((entity) => this.entityToDto(entity));
    } catch (error) {
      this.logger.error('Error fetching news from database:', error.message);
      return [];
    }
  }

  async getNewsByTimeRange(startDate: Date, endDate: Date): Promise<NewsEntity[]> {
    return this.repository
      .createQueryBuilder('news')
      .where('news.published_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('news.published_at', 'DESC')
      .getMany();
  }

  async getNewsBySentiment(sentiment: 'positive' | 'negative' | 'neutral'): Promise<NewsEntity[]> {
    return this.repository.find({
      where: { sentiment_label: sentiment },
      order: { published_at: 'DESC' },
      take: 50,
    });
  }

  async getNewsPaginated(page: number = 1, limit: number = 10): Promise<{ data: NewsItemDto[], total: number, page: number, totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [entities, total] = await this.repository.findAndCount({
        order: { published_at: 'DESC' },
        skip,
        take: limit,
      });

      const data = entities.map((entity) => this.entityToDto(entity));
      
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error fetching paginated news:', error.message);
      return { data: [], total: 0, page, totalPages: 0 };
    }
  }

  async getNewsBySentimentPaginated(
    sentiment: 'positive' | 'negative' | 'neutral',
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: NewsItemDto[], total: number, page: number, totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [entities, total] = await this.repository.findAndCount({
        where: { sentiment_label: sentiment },
        order: { published_at: 'DESC' },
        skip,
        take: limit,
      });

      const data = entities.map((entity) => this.entityToDto(entity));
      
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error fetching paginated news by sentiment:', error.message);
      return { data: [], total: 0, page, totalPages: 0 };
    }
  }

  private mapSentimentToLabel(sentiment: string): 'positive' | 'negative' | 'neutral' {
    if (sentiment === 'bullish') return 'positive';
    if (sentiment === 'bearish') return 'negative';
    return 'neutral';
  }

  private calculateAdvancedSentiment(
    title: string,
    body: string,
    upvotes: number,
    downvotes: number
  ): { score: number; label: 'positive' | 'negative' | 'neutral' } {
    // Kết hợp title và body để phân tích
    const combinedText = `${title} ${(body || '').substring(0, 500)}`;
    
    // Sử dụng Sentiment library (VADER-like) để phân tích
    const result = this.sentimentAnalyzer.analyze(combinedText);
    
    // result.score: số dương là positive, số âm là negative
    // result.comparative: normalized score (-5 đến +5 thường)
    
    // Tính VoteScore
    let voteScore = 0;
    const totalVotes = upvotes + downvotes;
    if (totalVotes > 0) {
      voteScore = (upvotes - downvotes) / totalVotes;
    }
    
    // Normalize sentiment score từ library về [-1, 1]
    // Sentiment library trả về score không chuẩn hóa, dùng comparative
    const textSentimentScore = Math.max(-1, Math.min(1, result.comparative / 5));
    
    // Kết hợp text sentiment với vote sentiment
    // 70% từ text analysis (VADER-like), 30% từ votes
    const w1 = 0.7;
    const w2 = 0.3;
    
    let finalScore = (w1 * textSentimentScore) + (w2 * voteScore);
    
    // Boost nếu có nhiều positive/negative words
    if (result.positive.length >= 3) {
      finalScore = Math.min(1, finalScore * 1.2);
    } else if (result.negative.length >= 3) {
      finalScore = Math.max(-1, finalScore * 1.2);
    }
    
    // Clamp trong [-1, 1]
    finalScore = Math.max(-1, Math.min(1, finalScore));
    
    // Xác định label dựa trên score - ngưỡng rất thấp để nhạy hơn
    let label: 'positive' | 'negative' | 'neutral';
    
    // Ngưỡng rất thấp
    if (finalScore >= 0.05) {
      label = 'positive';
    } else if (finalScore <= -0.05) {
      label = 'negative';
    } else if (finalScore > 0 && result.positive.length > result.negative.length) {
      label = 'positive';
    } else if (finalScore < 0 && result.negative.length > result.positive.length) {
      label = 'negative';
    } else if (result.positive.length > 0 && result.negative.length === 0) {
      label = 'positive';
    } else if (result.negative.length > 0 && result.positive.length === 0) {
      label = 'negative';
    } else {
      label = 'neutral';
    }
    
    this.logger.log(`Sentiment: "${title.substring(0, 60)}" -> text_score: ${textSentimentScore.toFixed(3)}, vote_score: ${voteScore.toFixed(3)}, final: ${finalScore.toFixed(3)}, label: ${label}, pos_words: ${result.positive.join(',') || 'none'}, neg_words: ${result.negative.join(',') || 'none'}`);
    
    return {
      score: Math.round(finalScore * 100) / 100,
      label: label
    };
  }

  private entityToDto(entity: NewsEntity): NewsItemDto {
    return {
      id: entity.id,
      title: entity.title,
      source: entity.source,
      url: entity.url,
      published_at: entity.published_at.toISOString(),
      sentiment: entity.sentiment_label === 'positive' ? 'bullish' : 
                 entity.sentiment_label === 'negative' ? 'bearish' : 'neutral',
      time: this.getTimeAgo(entity.published_at),
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  }
}
