import { Controller, Get, Param, Logger, HttpStatus, HttpException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, TokenRoleGuard } from '@app/core';
import { TokenRole, TokenRoles } from '@app/common';
import { NewsSentiment } from '../entities/news-sentiment.entity';

@ApiTags('Sentiment')
@Controller('sentiment')
export class SentimentController {
  private readonly logger = new Logger(SentimentController.name);

  constructor(
    @InjectRepository(NewsSentiment)
    private readonly sentimentRepo: Repository<NewsSentiment>,
  ) {}

  /**
   * Get sentiment for a specific news article
   * 
   * @example
   * GET /sentiment/:newsId
   */
  @Get(':newsId')
  @UseGuards(JwtAuthGuard, TokenRoleGuard)
  @TokenRoles(TokenRole.VIP, TokenRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sentiment for a news article (VIP only)' })
  async getSentiment(@Param('newsId') newsId: string) {
    this.logger.log(`📊 Fetching sentiment for news ${newsId}`);

    try {
      const sentiment = await this.sentimentRepo.findOne({
        where: { newsId },
      });

      if (!sentiment) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Sentiment not found for news ${newsId}`,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Sentiment retrieved successfully',
        data: {
          newsId: sentiment.newsId,
          sentimentScore: sentiment.sentimentScore,
          sentimentLabel: sentiment.sentimentLabel,
          confidence: sentiment.confidence,
          model: sentiment.model,
          analyzedAt: sentiment.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching sentiment: ${error.message}`);
      
      if (error.status) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to fetch sentiment',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get sentiment for multiple news articles
   * 
   * @example
   * GET /sentiment/batch?newsIds=id1,id2,id3
   */
  @Get('batch')
  @UseGuards(JwtAuthGuard, TokenRoleGuard)
  @TokenRoles(TokenRole.VIP, TokenRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sentiments for multiple news articles (VIP only)' })
  async getBatchSentiments() {
    this.logger.log('📊 Fetching batch sentiments');

    try {
      const sentiments = await this.sentimentRepo.find({
        take: 100,
        order: { createdAt: 'DESC' },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Sentiments retrieved successfully',
        data: sentiments.map((s) => ({
          newsId: s.newsId,
          sentimentScore: s.sentimentScore,
          sentimentLabel: s.sentimentLabel,
          confidence: s.confidence,
          model: s.model,
          analyzedAt: s.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching batch sentiments: ${error.message}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to fetch sentiments',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
