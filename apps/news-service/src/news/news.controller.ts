import { Controller, Get, Post, Param } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('sync')
  async manualSync() {
    this.newsService.handleCron(); 
    return { message: 'News synchronization triggered in background.' };
  }

  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }
}