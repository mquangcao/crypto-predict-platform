export interface ImpactQueueMessage {
  newsId: string;
  symbol: string;
  publishedAt: string; // ISO timestamp
  timeframe: '15m' | '1h' | '1d';
}

export interface CandleData {
  timestamp: Date;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
