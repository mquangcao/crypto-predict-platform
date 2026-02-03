import { client as axios } from '../axios';

export interface PredictionFeatures {
  symbol: string;
  timeframe: string;
  sentimentScore: number;
  sentimentLabel: string;
  confidence: number;
  rsi14?: number;
  macdHistogram?: number;
  priceToSma200Ratio?: number;
  priceToEma50Ratio?: number;
  volatilityAtr14?: number;
  bbWidth?: number;
  volumeRatio24h?: number;
  btcPriceChange24h?: number;
  btcDominance?: number;
}

export interface PredictionOutput {
  predictedReturnPct: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL' | 'HOLD';
  reasoning: string;
}

export interface PredictionResult {
  success: boolean;
  prediction?: PredictionOutput;
  input: PredictionFeatures;
  metadata: {
    endpointName: string;
    modelVersion?: string;
    timestamp: string;
    latencyMs: number;
  };
  error?: string;
}

export interface QuickPredictionParams {
  symbol?: string;
  timeframe?: string;
  sentiment?: number;
  rsi?: number;
  macd?: number;
}

export const predictionApi = {
  /**
   * Get prediction with full features
   */
  async predict(features: PredictionFeatures): Promise<PredictionResult> {
    const { data } = await axios.post('/prediction', features);
    return data.data || data;
  },

  /**
   * Quick prediction with minimal parameters
   */
  async quickPredict(params: QuickPredictionParams): Promise<PredictionResult> {
    const { data } = await axios.get('/prediction/quick', { params });
    return data.data || data;
  },

  /**
   * Prediction based on news sentiment (for per-news AI predictions)
   */
  async predictFromNewsSentiment(params: {
    symbol?: string;
    timeframe?: string;
    sentiment: string;
    confidence?: number;
  }): Promise<PredictionResult> {
    const { data } = await axios.get('/prediction/news-sentiment', { 
      params: {
        symbol: params.symbol || 'BTCUSDT',
        timeframe: params.timeframe || '1h',
        sentiment: params.sentiment,
        confidence: params.confidence || 0.8,
      }
    });
    return data.data || data;
  },

  /**
   * Prediction based on stored sentiment by news ID
   */
  async predictFromNewsId(params: {
    newsId: string;
    symbol?: string;
    timeframe?: string;
  }): Promise<PredictionResult> {
    const { data } = await axios.get(`/prediction/news/${params.newsId}`, {
      params: {
        symbol: params.symbol || 'BTCUSDT',
        timeframe: params.timeframe || '1h',
      },
    });
    return data.data || data;
  },

  /**
   * Batch predictions
   */
  async batchPredict(inputs: PredictionFeatures[]): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: PredictionResult[];
  }> {
    const { data } = await axios.post('/prediction/batch', { inputs });
    return data.data || data;
  },

  /**
   * Health check for SageMaker endpoint
   */
  async healthCheck(): Promise<{
    service: string;
    status: string;
    endpoint: string;
    timestamp: string;
    error?: string;
  }> {
    const { data } = await axios.get('/prediction/health');
    return data.data || data;
  },
};
