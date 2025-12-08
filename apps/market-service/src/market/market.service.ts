import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type Timeframe = '1m' | '5m' | '1h' | '1d';

export interface Candle {
  time: number;        // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  description: string;
  baseAsset: string;
  quoteAsset: string;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private readonly BINANCE_BASE_URL = 'https://api.binance.com';

  // danh sách symbol bạn support trong hệ thống (sau này có thể load từ DB)
  private readonly supportedSymbols: SymbolInfo[] = [
    {
      symbol: 'BTCUSDT',
      description: 'Bitcoin / Tether',
      baseAsset: 'BTC',
      quoteAsset: 'USDT',
    },
    {
      symbol: 'ETHUSDT',
      description: 'Ethereum / Tether',
      baseAsset: 'ETH',
      quoteAsset: 'USDT',
    },
    {
      symbol: 'BNBUSDT',
      description: 'BNB / Tether',
      baseAsset: 'BNB',
      quoteAsset: 'USDT',
    },
  ];

  getSymbols(): SymbolInfo[] {
    return this.supportedSymbols;
  }

  async getCandles(
    symbol: string,
    timeframe: Timeframe,
    limit = 200,
  ): Promise<Candle[]> {
    // Map timeframe -> interval Binance (trùng luôn: 1m, 5m, 1h, 1d)
    const interval = timeframe;

    const url = `${this.BINANCE_BASE_URL}/api/v3/klines`;

    try {
      const res = await axios.get(url, {
        params: {
          symbol,
          interval,
          limit,
        },
        timeout: 5000,
      });

      const data = res.data as any[];

      // Binance kline format:
      // [ openTime, open, high, low, close, volume, closeTime, ... ]
      const candles: Candle[] = data.map((k) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));

      return candles;
    } catch (error: any) {
      this.logger.error(
        `Error fetching klines from Binance for ${symbol} ${timeframe}`,
        error?.message,
      );
      throw error;
    }
  }
}
