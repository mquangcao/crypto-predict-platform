export type Timeframe = '1m' | '5m' | '1h' | '1d';

export interface Candle {
  time: number; // unix seconds
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

export interface PriceUpdate {
  symbol: string;
  price: number;
  ts: number;
}

export interface CurrentPrice {
  symbol: string;
  price: number;
}
