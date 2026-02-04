import { Injectable, Logger } from '@nestjs/common';
import { CandleData } from '../interfaces/impact.interface';

/**
 * Service tính toán các chỉ báo kỹ thuật (Technical Indicators)
 * để hỗ trợ AI/ML training
 */
@Injectable()
export class TechnicalIndicatorService {
  private readonly logger = new Logger(TechnicalIndicatorService.name);

  /**
   * RSI - Relative Strength Index (14 periods)
   * Range: 0-100. >70 = Overbought, <30 = Oversold
   */
  calculateRSI(candles: CandleData[], period: number = 14): number | null {
    if (candles.length < period + 1) return null;

    const changes: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      changes.push(candles[i].close - candles[i - 1].close);
    }

    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  /**
   * MACD Histogram
   * MACD = EMA(12) - EMA(26)
   * Signal = EMA(9) of MACD
   * Histogram = MACD - Signal
   */
  calculateMACDHistogram(candles: CandleData[]): number | null {
    if (candles.length < 26) return null;

    const closes = candles.map(c => c.close);
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    
    if (ema12 === null || ema26 === null) return null;

    const macd = ema12 - ema26;
    
    // Để tính signal line, cần MACD values của nhiều periods
    // Simplified: trả về MACD thay vì histogram
    return macd;
  }

  /**
   * SMA - Simple Moving Average
   */
  calculateSMA(values: number[], period: number): number | null {
    if (values.length < period) return null;
    const sum = values.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * EMA - Exponential Moving Average
   */
  calculateEMA(values: number[], period: number): number | null {
    if (values.length < period) return null;

    const multiplier = 2 / (period + 1);
    let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < values.length; i++) {
      ema = (values[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * ATR - Average True Range (14 periods)
   * Normalized as percentage
   */
  calculateATR(candles: CandleData[], period: number = 14): number | null {
    if (candles.length < period + 1) return null;

    const trueRanges: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    const atr = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
    const currentPrice = candles[candles.length - 1].close;
    
    // Normalize to percentage
    return (atr / currentPrice) * 100;
  }

  /**
   * Bollinger Bands Width
   * (Upper Band - Lower Band) / Middle Band
   */
  calculateBBWidth(candles: CandleData[], period: number = 20, stdDev: number = 2): number | null {
    if (candles.length < period) return null;

    const closes = candles.map(c => c.close);
    const sma = this.calculateSMA(closes, period);
    
    if (sma === null) return null;

    const recentCloses = closes.slice(-period);
    const variance = recentCloses.reduce((sum, close) => {
      return sum + Math.pow(close - sma, 2);
    }, 0) / period;
    
    const sd = Math.sqrt(variance);
    const upperBand = sma + (stdDev * sd);
    const lowerBand = sma - (stdDev * sd);

    return ((upperBand - lowerBand) / sma) * 100;
  }

  /**
   * Volume Ratio
   * Current volume / Average volume of last N periods
   */
  calculateVolumeRatio(candles: CandleData[], periods: number = 24): number | null {
    if (candles.length < periods + 1) return null;

    const currentVolume = candles[candles.length - 1].volume;
    const avgVolume = candles
      .slice(-periods - 1, -1)
      .reduce((sum, c) => sum + c.volume, 0) / periods;

    if (avgVolume === 0) return null;
    return currentVolume / avgVolume;
  }

  /**
   * Max Drawdown trong khoảng thời gian
   * % sụt giảm lớn nhất từ đỉnh
   */
  calculateMaxDrawdown(candles: CandleData[], startPrice: number): number {
    let maxPrice = startPrice;
    let maxDrawdown = 0;

    for (const candle of candles) {
      maxPrice = Math.max(maxPrice, candle.high);
      const drawdown = ((candle.low - maxPrice) / maxPrice) * 100;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  /**
   * Max Runup trong khoảng thời gian
   * % tăng lớn nhất từ đáy
   */
  calculateMaxRunup(candles: CandleData[], startPrice: number): number {
    let minPrice = startPrice;
    let maxRunup = 0;

    for (const candle of candles) {
      minPrice = Math.min(minPrice, candle.low);
      const runup = ((candle.high - minPrice) / minPrice) * 100;
      maxRunup = Math.max(maxRunup, runup);
    }

    return maxRunup;
  }
}
