import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsItemDto } from './dto/news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getNews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sentiment') sentiment?: 'positive' | 'negative' | 'neutral',
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    
    if (sentiment) {
      return this.newsService.getNewsBySentiment(sentiment, pageNum, limitNum);
    }
    
    return this.newsService.getLatestNews(pageNum, limitNum);
  }
}
