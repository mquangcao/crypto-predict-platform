import { Controller, Post, Get, Body, Query, Logger, HttpStatus, HttpException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SageMakerInferenceService } from '../services/sagemaker-inference.service';
import type { PredictionFeatures } from '../interfaces/prediction.interface';
import { NewsSentiment } from '../../sentiment/entities/news-sentiment.entity';
import { NewsPriceImpact } from '../../impact/entities/news-price-impact.entity';

@Controller('prediction')
export class PredictionController {
  private readonly logger = new Logger(PredictionController.name);

  constructor(
    private readonly inferenceService: SageMakerInferenceService,
    @InjectRepository(NewsSentiment)
    private readonly sentimentRepo: Repository<NewsSentiment>,
    @InjectRepository(NewsPriceImpact)
    private readonly impactRepo: Repository<NewsPriceImpact>,
  ) {}

  /**
   * Get price prediction for a single input
   * 
   * @example
   * POST /prediction
   * Body: {
   *   "symbol": "BTCUSDT",
   *   "timeframe": "1h",
   *   "sentimentScore": 0.75,
   *   "sentimentLabel": "positive",
   *   "confidence": 0.85,
   *   "rsi14": 65.5,
   *   "macdHistogram": 12.3
   * }
   */
  @Post()
  async getPrediction(@Body() features: PredictionFeatures) {
    this.logger.log(`🔮 Prediction request for ${features.symbol} ${features.timeframe}`);

    try {
      const result = await this.inferenceService.predict(features);
      
      if (!result.success) {
        throw new HttpException(
          result.error || 'Prediction failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return result;
    } catch (error) {
      this.logger.error('Prediction error:', error.stack);
      throw new HttpException(
        error.message || 'Failed to get prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Batch prediction for multiple inputs
   * 
   * @example
   * POST /prediction/batch
   * Body: {
   *   "inputs": [
   *     { "symbol": "BTCUSDT", "timeframe": "1h", ... },
   *     { "symbol": "ETHUSDT", "timeframe": "1h", ... }
   *   ]
   * }
   */
  @Post('batch')
  async getBatchPredictions(@Body('inputs') inputs: PredictionFeatures[]) {
    this.logger.log(`📦 Batch prediction request for ${inputs.length} inputs`);

    if (!Array.isArray(inputs) || inputs.length === 0) {
      throw new HttpException(
        'Invalid input: expected array of features',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const results = await this.inferenceService.batchPredict(inputs);
      
      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      return {
        total: results.length,
        successful,
        failed,
        results,
      };
    } catch (error) {
      this.logger.error('Batch prediction error:', error.stack);
      throw new HttpException(
        error.message || 'Failed to get batch predictions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get prediction based on news sentiment
   * This endpoint is useful for showing per-news AI predictions
   * 
   * @example
   * GET /prediction/news-sentiment?symbol=BTCUSDT&sentiment=positive
   * GET /prediction/news-sentiment?symbol=BTCUSDT&sentiment=positive&timeframe=1h&confidence=0.85
   */
  @Get('news-sentiment')
  async getPredictionForNewsSentiment(
    @Query('symbol') symbol: string = 'BTCUSDT',
    @Query('timeframe') timeframe: string = '1h',
    @Query('sentiment') sentimentLabel: string = 'neutral',
    @Query('confidence') confidenceStr: string = '0.8',
  ) {
    this.logger.log(`🔮 Prediction request for news sentiment: ${sentimentLabel} on ${symbol}`);

    // Convert sentiment label to score
    const sentimentMap = {
      positive: 0.75,
      bullish: 0.85,
      negative: -0.75,
      bearish: -0.85,
      neutral: 0,
    };

    const sentimentScore = sentimentMap[sentimentLabel.toLowerCase()] ?? 0;
    const confidence = parseFloat(confidenceStr) || 0.8;

    const features: PredictionFeatures = {
      symbol,
      timeframe,
      sentimentScore,
      sentimentLabel: sentimentLabel.toLowerCase(),
      confidence,
      // Other technical indicators not available for news-based prediction
      // They will be filled with NaN and the model will impute them
    };

    try {
      const result = await this.inferenceService.predict(features);
      
      if (!result.success) {
        throw new HttpException(
          result.error || 'Prediction failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return result;
    } catch (error) {
      this.logger.error('News sentiment prediction error:', error.stack);
      throw new HttpException(
        error.message || 'Failed to get prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get prediction for a news item by ID
   * This fetches the news sentiment and impact data, then gets prediction
   * 
   * @example
   * GET /prediction/news/123
   */
  @Get('news/:newsId')
  async getPredictionForNews(
    @Param('newsId') newsId: string,
    @Query('symbol') symbol: string = 'BTCUSDT',
    @Query('timeframe') timeframe: string = '1h',
  ) {
    this.logger.log(`🔮 Prediction request for news ID: ${newsId}`);

    const sentiment = await this.sentimentRepo.findOne({ where: { newsId } });
    const impact = await this.impactRepo.findOne({
      where: { newsId, symbol, timeframe },
      order: { createdAt: 'DESC' },
    });

    if (!sentiment) {
      return {
        success: false,
        error: `Sentiment not found for news ID: ${newsId}`,
        input: {
          symbol,
          timeframe,
          sentimentScore: 0,
          sentimentLabel: 'neutral',
          confidence: 0.8,
        },
        metadata: {
          endpointName: 'unknown',
          timestamp: new Date().toISOString(),
          latencyMs: 0,
        },
      };
    }

    const safeSentimentScore = typeof sentiment.sentimentScore === 'number'
      ? sentiment.sentimentScore
      : 0;
    const safeConfidence = typeof sentiment.confidence === 'number'
      ? sentiment.confidence
      : 0.8;
    const safeLabel = sentiment.sentimentLabel ?? (safeSentimentScore > 0 ? 'positive' : safeSentimentScore < 0 ? 'negative' : 'neutral');

    const features: PredictionFeatures = {
      symbol,
      timeframe,
      sentimentScore: safeSentimentScore,
      sentimentLabel: safeLabel,
      confidence: safeConfidence,
      rsi14: impact?.rsi14,
      macdHistogram: impact?.macdHistogram,
      priceToSma200Ratio: impact?.priceToSma200Ratio,
      priceToEma50Ratio: impact?.priceToEma50Ratio,
      volatilityAtr14: impact?.volatilityAtr14,
      bbWidth: impact?.bbWidth,
      volumeRatio24h: impact?.volumeRatio24h,
      btcPriceChange24h: impact?.btcPriceChange24h,
      btcDominance: impact?.btcDominance,
    };

    try {
      const result = await this.inferenceService.predict(features);
      return result;
    } catch (error) {
      this.logger.error('News prediction error:', error.stack);
      throw new HttpException(
        error.message || 'Failed to get prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check for SageMaker endpoint
   * 
   * @example
   * GET /prediction/health
   */
  @Get('health')
  async healthCheck() {
    this.logger.log('🏥 Health check requested');

    try {
      const health = await this.inferenceService.healthCheck();
      
      return {
        service: 'SageMaker Inference',
        status: health.healthy ? 'healthy' : 'unhealthy',
        endpoint: health.endpointName,
        timestamp: new Date().toISOString(),
        error: health.error,
      };
    } catch (error) {
      this.logger.error('Health check error:', error.stack);
      return {
        service: 'SageMaker Inference',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Get prediction with simplified input (for quick testing)
   * 
   * @example
   * GET /prediction/quick?symbol=BTCUSDT&sentiment=0.75&rsi=65
   */
  @Get('quick')
  async getQuickPrediction(
    @Query('symbol') symbol: string = 'BTCUSDT',
    @Query('timeframe') timeframe: string = '1h',
    @Query('sentiment') sentimentScore: string = '0',
    @Query('rsi') rsi: string,
    @Query('macd') macd: string,
  ) {
    this.logger.log(`⚡ Quick prediction request for ${symbol} ${timeframe}`);

    const features: PredictionFeatures = {
      symbol,
      timeframe,
      sentimentScore: parseFloat(sentimentScore),
      sentimentLabel: parseFloat(sentimentScore) > 0 ? 'positive' : parseFloat(sentimentScore) < 0 ? 'negative' : 'neutral',
      confidence: 0.8,
      rsi14: rsi ? parseFloat(rsi) : undefined,
      macdHistogram: macd ? parseFloat(macd) : undefined,
    };

    try {
      const result = await this.inferenceService.predict(features);
      
      if (!result.success) {
        throw new HttpException(
          result.error || 'Prediction failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return result;
    } catch (error) {
      this.logger.error('Quick prediction error:', error.stack);
      throw new HttpException(
        error.message || 'Failed to get prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
