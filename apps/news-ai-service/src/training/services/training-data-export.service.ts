import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsSentiment } from '../../sentiment/entities/news-sentiment.entity';
import { NewsPriceImpact } from '../../impact/entities/news-price-impact.entity';

export interface TrainingDataRow {
  // News metadata
  newsId: string;
  symbol: string;
  timeframe: string;
  
  // Sentiment features
  sentimentScore: number;
  sentimentLabel: string;
  confidence: number | null;
  
  // Target (Label)
  returnPct: number;
  maxDrawdownPct: number | null;
  maxRunupPct: number | null;
  
  // Momentum features
  rsi14: number | null;
  macdHistogram: number | null;
  
  // Trend features
  priceToSma200Ratio: number | null;
  priceToEma50Ratio: number | null;
  
  // Volatility features
  volatilityAtr14: number | null;
  bbWidth: number | null;
  
  // Liquidity features
  volumeRatio24h: number | null;
  
  // Market correlation features
  btcPriceChange24h: number | null;
  btcDominance: number | null;
  
  // Metadata
  impactCreatedAt: Date;
}

@Injectable()
export class TrainingDataExportService {
  private readonly logger = new Logger(TrainingDataExportService.name);

  constructor(
    @InjectRepository(NewsSentiment)
    private readonly sentimentRepo: Repository<NewsSentiment>,
    @InjectRepository(NewsPriceImpact)
    private readonly impactRepo: Repository<NewsPriceImpact>,
  ) {}

  /**
   * Export training data by joining sentiment and impact tables
   */
  async exportTrainingData(
    startDate?: Date,
    endDate?: Date,
  ): Promise<TrainingDataRow[]> {
    const query = this.impactRepo
      .createQueryBuilder('impact')
      .innerJoinAndSelect(
        NewsSentiment,
        'sentiment',
        'sentiment.newsId = impact.newsId',
      )
      .select([
        'impact.newsId as "newsId"',
        'impact.symbol as symbol',
        'impact.timeframe as timeframe',
        
        // Sentiment
        'sentiment.sentimentScore as "sentimentScore"',
        'sentiment.sentimentLabel as "sentimentLabel"',
        'sentiment.confidence as confidence',
        
        // Target
        'impact.returnPct as "returnPct"',
        'impact.maxDrawdownPct as "maxDrawdownPct"',
        'impact.maxRunupPct as "maxRunupPct"',
        
        // Momentum
        'impact.rsi14 as rsi14',
        'impact.macdHistogram as "macdHistogram"',
        
        // Trend
        'impact.priceToSma200Ratio as "priceToSma200Ratio"',
        'impact.priceToEma50Ratio as "priceToEma50Ratio"',
        
        // Volatility
        'impact.volatilityAtr14 as "volatilityAtr14"',
        'impact.bbWidth as "bbWidth"',
        
        // Liquidity
        'impact.volumeRatio24h as "volumeRatio24h"',
        
        // Market correlation
        'impact.btcPriceChange24h as "btcPriceChange24h"',
        'impact.btcDominance as "btcDominance"',
        
        // Metadata
        'impact.createdAt as "impactCreatedAt"',
      ]);

    if (startDate) {
      query.andWhere('impact.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('impact.createdAt <= :endDate', { endDate });
    }

    query.orderBy('impact.createdAt', 'ASC');

    const results = await query.getRawMany<TrainingDataRow>();

    this.logger.log(`📊 Exported ${results.length} training data rows`);
    
    return results;
  }

  /**
   * Convert training data to CSV format
   */
  convertToCSV(data: TrainingDataRow[]): string {
    if (data.length === 0) {
      return '';
    }

    // Header
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');

    // Rows
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        
        // Handle null values
        if (value === null || value === undefined) {
          return '';
        }
        
        // Handle dates
        if (value instanceof Date) {
          return value.toISOString();
        }
        
        // Handle strings with commas (escape)
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        
        return value;
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Get statistics about training data
   */
  async getDatasetStats(): Promise<{
    totalRows: number;
    dateRange: { min: Date; max: Date } | null;
    symbolDistribution: Record<string, number>;
    sentimentDistribution: Record<string, number>;
  }> {
    // Total rows
    const totalRows = await this.impactRepo
      .createQueryBuilder('impact')
      .innerJoin(NewsSentiment, 'sentiment', 'sentiment.newsId = impact.newsId')
      .getCount();

    // Date range
    const dateRangeResult = await this.impactRepo
      .createQueryBuilder('impact')
      .select('MIN(impact.createdAt)', 'min')
      .addSelect('MAX(impact.createdAt)', 'max')
      .getRawOne<{ min: Date; max: Date }>();

    // Symbol distribution
    const symbolDist = await this.impactRepo
      .createQueryBuilder('impact')
      .select('impact.symbol', 'symbol')
      .addSelect('COUNT(*)', 'count')
      .groupBy('impact.symbol')
      .orderBy('count', 'DESC')
      .getRawMany<{ symbol: string; count: string }>();

    // Sentiment distribution
    const sentimentDist = await this.impactRepo
      .createQueryBuilder('impact')
      .innerJoin(NewsSentiment, 'sentiment', 'sentiment.newsId = impact.newsId')
      .select('sentiment.sentimentLabel', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sentiment.sentimentLabel')
      .getRawMany<{ label: string; count: string }>();

    return {
      totalRows,
      dateRange: dateRangeResult && dateRangeResult.min && dateRangeResult.max 
        ? { min: dateRangeResult.min, max: dateRangeResult.max }
        : null,
      symbolDistribution: Object.fromEntries(
        symbolDist.map(s => [s.symbol, parseInt(s.count)])
      ),
      sentimentDistribution: Object.fromEntries(
        sentimentDist.map(s => [s.label, parseInt(s.count)])
      ),
    };
  }
}
