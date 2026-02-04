import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceCandle } from '../entities/price-candle.entity';
import { MarketService } from './market.service';

@Injectable()
export class CandleStorageService implements OnModuleInit {
  private readonly logger = new Logger(CandleStorageService.name);
  private readonly symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

  constructor(
    @InjectRepository(PriceCandle)
    private readonly candleRepository: Repository<PriceCandle>,
    private readonly marketService: MarketService,
  ) {}

  async onModuleInit() {
    // Fetch initial historical data when service starts
    this.logger.log('Fetching initial historical candle data...');
    await this.fetchAndStoreHistoricalCandles();
    this.logger.log('Initial historical data loaded');
  }

  /**
   * Fetch last 1000 1m candles for each symbol on startup
   */
  private async fetchAndStoreHistoricalCandles() {
    for (const symbol of this.symbols) {
      try {
        const candles = await this.marketService.getCandles(symbol, '1m', 1000);
        await this.saveCandles(symbol, candles);
        this.logger.log(`Stored ${candles.length} historical candles for ${symbol}`);
        
        // Add delay between symbols to avoid rate limiting
        await this.sleep(1000); // 1 second delay
      } catch (error) {
        this.logger.error(`Error fetching historical data for ${symbol}:`, error);
      }
    }
  }

  /**
   * Cron job runs every minute to fetch latest 1m candle
   * This keeps the database up to date with fresh data
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async fetchLatestCandles() {
    this.logger.debug('Fetching latest 1m candles...');
    
    for (const symbol of this.symbols) {
      try {
        // Fetch only the latest 2 candles (current + previous)
        const candles = await this.marketService.getCandles(symbol, '1m', 2);
        await this.saveCandles(symbol, candles);
        this.logger.debug(`Updated ${symbol} with latest candle`);
        
        // Small delay between symbols to avoid rate limiting
        await this.sleep(500); // 500ms delay
      } catch (error) {
        this.logger.error(`Error fetching latest candle for ${symbol}:`, error);
      }
    }
  }

  /**
   * Save candles to database (upsert to handle duplicates)
   */
  private async saveCandles(symbol: string, candles: any[]) {
    const entities = candles.map(candle => {
      const entity = new PriceCandle();
      entity.timestamp = new Date(candle.time * 1000);
      entity.symbol = symbol;
      entity.open = candle.open;
      entity.high = candle.high;
      entity.low = candle.low;
      entity.close = candle.close;
      entity.volume = candle.volume;
      return entity;
    });

    // Use upsert to handle duplicate timestamps
    await this.candleRepository.upsert(entities, {
      conflictPaths: ['timestamp', 'symbol'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  /**
   * Query candles for a specific timeframe
   * This uses TimescaleDB continuous aggregates for 15m, 1h, 1d
   */
  async getCandles(
    symbol: string,
    timeframe: '1m' | '15m' | '1h' | '1d',
    startTime: Date,
    endTime: Date,
  ): Promise<PriceCandle[]> {
    let tableName = 'price_candles';
    
    // Use continuous aggregates for larger timeframes
    if (timeframe === '15m') tableName = 'price_candles_15m';
    else if (timeframe === '1h') tableName = 'price_candles_1h';
    else if (timeframe === '1d') tableName = 'price_candles_1d';

    const query = `
      SELECT timestamp, symbol, open, high, low, close, volume
      FROM ${tableName}
      WHERE symbol = $1 
        AND timestamp >= $2 
        AND timestamp <= $3
      ORDER BY timestamp ASC
    `;

    return this.candleRepository.query(query, [symbol, startTime, endTime]);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the most recent candle for a symbol
   */
  async getLatestCandle(symbol: string, timeframe: '1m' | '15m' | '1h' | '1d' = '1m'): Promise<PriceCandle | null> {
    let tableName = 'price_candles';
    
    if (timeframe === '15m') tableName = 'price_candles_15m';
    else if (timeframe === '1h') tableName = 'price_candles_1h';
    else if (timeframe === '1d') tableName = 'price_candles_1d';

    const query = `
      SELECT timestamp, symbol, open, high, low, close, volume
      FROM ${tableName}
      WHERE symbol = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    const result = await this.candleRepository.query(query, [symbol]);
    return result[0] || null;
  }
}
