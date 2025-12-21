import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { NewsEntity } from './entities/news.entity';
import { NewsItemDto } from './dto/news.dto';

@Injectable()
export class NewsRepository {
  private readonly logger = new Logger(NewsRepository.name);

  constructor(
    @InjectRepository(NewsEntity)
    private readonly repository: Repository<NewsEntity>,
  ) {}

  async saveNews(newsItems: any[], apiSource: string): Promise<void> {
    try {
      let savedCount = 0;
      let skippedCount = 0;

      for (const item of newsItems) {
        try {
          // Check if news already exists
          const existing = await this.repository.findOne({ where: { id: item.id } });
          
          if (existing) {
            // Update existing news
            existing.title = item.title;
            existing.source = item.source;
            existing.url = item.url || '';
            existing.published_at = new Date(item.published_at);
            existing.body = item.body || item.description || '';
            existing.categories = item.categories || '';
            existing.api_source = apiSource;
            existing.sentiment_from_source = item.sentiment_from_source || item.sentiment;
            
            await this.repository.save(existing);
            skippedCount++;
          } else {
            // Create new entity
            const entity = new NewsEntity();
            entity.id = item.id;
            entity.title = item.title;
            entity.source = item.source;
            entity.url = item.url || '';
            entity.published_at = new Date(item.published_at);
            entity.body = item.body || item.description || '';
            entity.categories = item.categories || '';
            entity.api_source = apiSource;
            entity.sentiment_from_source = item.sentiment_from_source || item.sentiment;

            await this.repository.save(entity);
            savedCount++;
          }
        } catch (itemError) {
          this.logger.warn(`Failed to save news item ${item.id}: ${itemError.message}`);
        }
      }

      this.logger.log(`Processed ${newsItems.length} news items: ${savedCount} new, ${skippedCount} updated`);
    } catch (error) {
      this.logger.error('Error saving news to database:', error.message);
    }
  }

  // Chua su dung
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

  //Chua su dung
  async getNewsByTimeRange(startDate: Date, endDate: Date): Promise<NewsEntity[]> {
    return this.repository
      .createQueryBuilder('news')
      .where('news.published_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('news.published_at', 'DESC')
      .getMany();
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
    sentiment: 'bullish' | 'bearish' | 'neutral',
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: NewsItemDto[], total: number, page: number, totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Query trực tiếp từ DB với sentiment đã có sẵn
      const [entities, total] = await this.repository.findAndCount({
        where: { sentiment_from_source: sentiment },
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

  private entityToDto(entity: NewsEntity): NewsItemDto {
    // Đọc sentiment trực tiếp từ DB (đã tính khi lưu)
    return {
      id: entity.id,
      title: entity.title,
      source: entity.source,
      url: entity.url,
      published_at: entity.published_at.toISOString(),
      sentiment: entity.sentiment_from_source || 'neutral',
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
