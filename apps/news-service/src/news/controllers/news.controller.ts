import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { 
  ResponseBuilder, 
  ApiResponseDto, 
  Public, 
  UserSession
} from '@app/common';
import type { TokenPayload } from '@app/common';
import { JwtAuthGuard } from '@app/core';

import { NewsService } from '../services/news.service';

@ApiTags('News')
@Controller({ path: 'news', version: '1' })
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('sync')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Manually trigger news synchronization',
    description: 'Triggers news crawl from all sources immediately'
  })
  async manualSync(@UserSession() user: TokenPayload) {
    this.newsService.handleCron();
    return ResponseBuilder.createResponse({ 
      message: 'News synchronization triggered in background.',
      data: null,
    });
  }

  @Get()
  @Public()
  @ApiOperation({ 
    summary: 'Get latest news',
    description: 'Returns latest news articles from all sources'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('limit') limit?: number) {
    const news = await this.newsService.findAll(limit ? +limit : 50);
    return ResponseBuilder.createResponse({ 
      data: news,
      message: 'Latest news retrieved successfully'
    });
  }

  @Get('symbol/:symbol')
  @Public()
  @ApiOperation({ 
    summary: 'Get news by cryptocurrency symbol',
    description: 'Returns news articles filtered by crypto symbol (BTC, ETH, etc.)'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findBySymbol(
    @Param('symbol') symbol: string,
    @Query('limit') limit?: number,
  ) {
    const news = await this.newsService.findBySymbol(symbol, limit ? +limit : 50);
    return ResponseBuilder.createResponse({ 
      data: news,
      message: `News for ${symbol.toUpperCase()} retrieved successfully`
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ 
    summary: 'Get news article by ID',
    description: 'Returns a single news article by its UUID'
  })
  async findOne(@Param('id') id: string) {
    const news = await this.newsService.findOne(id);
    return ResponseBuilder.createResponse({ 
      data: news,
      message: 'News article retrieved successfully'
    });
  }
}