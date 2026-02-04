import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SERVICE, MARKET_OPERATION } from '@app/common';
import { GatewayService } from '@app/core';
import { NewsPriceImpact } from '../entities/news-price-impact.entity';
import { CandleData } from '../interfaces/impact.interface';
import { TechnicalIndicatorService } from './technical-indicator.service';

@Injectable()
export class ImpactAnalysisService {
  private readonly logger = new Logger(ImpactAnalysisService.name);

  constructor(
    @InjectRepository(NewsPriceImpact)
    private readonly impactRepository: Repository<NewsPriceImpact>,
    private readonly gatewayService: GatewayService,
    private readonly technicalIndicatorService: TechnicalIndicatorService,
  ) {}

  async analyzeImpact(
    newsId: string,
    symbol: string,
    publishedAt: Date,
    timeframe: '15m' | '1h' | '1d',
  ): Promise<void> {
    try {
      // 1. Tính thời điểm before và after dựa vào timeframe
      const timeframeMs = this.getTimeframeInMs(timeframe);
      const beforeTime = new Date(publishedAt.getTime() - timeframeMs);
      const afterTime = new Date(publishedAt.getTime() + timeframeMs);

      // 2. Lấy candles từ market-service
      const [candleBefore, candleAfter] = await Promise.all([
        this.getCandleAtTime(symbol, timeframe, beforeTime),
        this.getCandleAtTime(symbol, timeframe, afterTime),
      ]);

      if (!candleBefore || !candleAfter) {
        this.logger.warn(
          `⚠️ Missing candle data for ${symbol} at ${timeframe}, ` +
          `newsId=${newsId}. Skipping impact calculation.`
        );
        return;
      }

      // 3. Tính toán impact metrics
      const priceBefore = candleBefore.close;
      const priceAfter = candleAfter.close;
      const returnPct = ((priceAfter - priceBefore) / priceBefore) * 100;

      // 4. Lấy candles trong khoảng thời gian để tính indicators
      const impactCandles = await this.getCandlesInRange(
        symbol,
        timeframe,
        beforeTime,
        afterTime,
      );

      // 5. Lấy historical candles để tính các indicators cần nhiều data (SMA200, RSI14, etc.)
      const historicalStartTime = new Date(beforeTime.getTime() - 200 * this.getTimeframeInMs(timeframe));
      const historicalCandles = await this.getCandlesInRange(
        symbol,
        timeframe,
        historicalStartTime,
        beforeTime,
      );

      // 6. Lấy BTC data nếu symbol không phải BTC
      let btcPriceChange24h: number | null = null;
      if (symbol !== 'BTCUSDT') {
        btcPriceChange24h = await this.getBtcPriceChange24h(publishedAt);
      }

      // 7. Tính toán các technical indicators
      const indicators = await this.calculateAllIndicators(
        historicalCandles,
        impactCandles,
        priceBefore,
      );

      // 8. Lưu vào database
      const impact = new NewsPriceImpact();
      impact.newsId = newsId;
      impact.symbol = symbol;
      impact.timeframe = timeframe;
      
      // Target values
      impact.priceBefore = priceBefore;
      impact.priceAfter = priceAfter;
      impact.returnPct = returnPct;
      impact.maxDrawdownPct = indicators.maxDrawdownPct;
      impact.maxRunupPct = indicators.maxRunupPct;

      // Momentum indicators
      impact.rsi14 = indicators.rsi14;
      impact.macdHistogram = indicators.macdHistogram;

      // Trend indicators
      impact.priceToSma200Ratio = indicators.priceToSma200Ratio;
      impact.priceToEma50Ratio = indicators.priceToEma50Ratio;

      // Volatility indicators
      impact.volatilityAtr14 = indicators.volatilityAtr14;
      impact.bbWidth = indicators.bbWidth;

      // Liquidity indicators
      impact.volumeRatio24h = indicators.volumeRatio24h;

      // Market correlation
      impact.btcPriceChange24h = btcPriceChange24h ?? undefined;

      await this.impactRepository.save(impact);

      this.logger.log(
        `✅ Impact saved: newsId=${newsId}, ${symbol} ${timeframe}, ` +
        `return=${returnPct.toFixed(2)}%, RSI=${indicators.rsi14?.toFixed(2) ?? 'N/A'}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error analyzing impact for newsId=${newsId}:`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Lấy 1 candle gần nhất tại thời điểm cụ thể
   */
  private async getCandleAtTime(
    symbol: string,
    timeframe: string,
    targetTime: Date,
  ): Promise<CandleData | null> {
    try {
      const startTime = new Date(targetTime.getTime() - this.getTimeframeInMs(timeframe as any) * 2);
      const endTime = new Date(targetTime.getTime() + this.getTimeframeInMs(timeframe as any) * 2);

      const candles = await this.gatewayService.runOperation<CandleData[]>({
        serviceId: SERVICE.MARKET,
        operationId: MARKET_OPERATION.GET_CANDLES,
        payload: {
          symbol,
          timeframe,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      if (!candles || candles.length === 0) {
        return null;
      }

      // Tìm candle gần nhất với targetTime
      const closestCandle = candles.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.timestamp).getTime() - targetTime.getTime());
        const currDiff = Math.abs(new Date(curr.timestamp).getTime() - targetTime.getTime());
        return currDiff < prevDiff ? curr : prev;
      });

      return closestCandle;
    } catch (error) {
      this.logger.error(`Error getting candle at time: ${error.message}`);
      return null;
    }
  }

  /**
   * Lấy tất cả candles trong khoảng thời gian
   */
  private async getCandlesInRange(
    symbol: string,
    timeframe: string,
    startTime: Date,
    endTime: Date,
  ): Promise<CandleData[]> {
    try {
      const candles = await this.gatewayService.runOperation<CandleData[]>({
        serviceId: SERVICE.MARKET,
        operationId: MARKET_OPERATION.GET_CANDLES,
        payload: {
          symbol,
          timeframe,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      return candles || [];
    } catch (error) {
      this.logger.error(`Error getting candles in range: ${error.message}`);
      return [];
    }
  }

  /**
   * Tính toán tất cả các technical indicators
   */
  private async calculateAllIndicators(
    historicalCandles: CandleData[],
    impactCandles: CandleData[],
    priceBefore: number,
  ) {
    const allCandles = [...historicalCandles, ...impactCandles];
    const ti = this.technicalIndicatorService;

    return {
      // Target metrics
      maxDrawdownPct: impactCandles.length > 0 
        ? ti.calculateMaxDrawdown(impactCandles, priceBefore) 
        : undefined,
      maxRunupPct: impactCandles.length > 0 
        ? ti.calculateMaxRunup(impactCandles, priceBefore) 
        : undefined,

      // Momentum
      rsi14: ti.calculateRSI(allCandles, 14) ?? undefined,
      macdHistogram: ti.calculateMACDHistogram(allCandles) ?? undefined,

      // Trend
      priceToSma200Ratio: this.calculatePriceToSmaRatio(allCandles, priceBefore, 200),
      priceToEma50Ratio: this.calculatePriceToEmaRatio(allCandles, priceBefore, 50),

      // Volatility
      volatilityAtr14: ti.calculateATR(allCandles, 14) ?? undefined,
      bbWidth: ti.calculateBBWidth(allCandles, 20, 2) ?? undefined,

      // Liquidity
      volumeRatio24h: ti.calculateVolumeRatio(allCandles, 24) ?? undefined,
    };
  }

  /**
   * Tính Price to SMA Ratio
   */
  private calculatePriceToSmaRatio(
    candles: CandleData[],
    currentPrice: number,
    period: number,
  ): number | undefined {
    const closes = candles.map(c => c.close);
    const sma = this.technicalIndicatorService.calculateSMA(closes, period);
    return sma ? currentPrice / sma : undefined;
  }

  /**
   * Tính Price to EMA Ratio
   */
  private calculatePriceToEmaRatio(
    candles: CandleData[],
    currentPrice: number,
    period: number,
  ): number | undefined {
    const closes = candles.map(c => c.close);
    const ema = this.technicalIndicatorService.calculateEMA(closes, period);
    return ema ? currentPrice / ema : undefined;
  }

  /**
   * Lấy % thay đổi giá BTC trong 24h
   */
  private async getBtcPriceChange24h(targetTime: Date): Promise<number | null> {
    try {
      const endTime = targetTime;
      const startTime = new Date(targetTime.getTime() - 24 * 60 * 60 * 1000);

      const candles = await this.getCandlesInRange(
        'BTCUSDT',
        '1h',
        startTime,
        endTime,
      );

      if (candles.length < 2) return null;

      const firstCandle = candles[0];
      const lastCandle = candles[candles.length - 1];
      
      return ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
    } catch (error) {
      this.logger.error(`Error getting BTC price change: ${error.message}`);
      return null;
    }
  }

  /**
   * Chuyển timeframe thành milliseconds
   */
  private getTimeframeInMs(timeframe: '15m' | '1h' | '1d'): number {
    const map = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };
    return map[timeframe];
  }
}
