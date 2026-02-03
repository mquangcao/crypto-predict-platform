/**
 * Input features for SageMaker prediction
 */
export interface PredictionFeatures {
  // News metadata
  symbol: string;
  timeframe: string;
  
  // Sentiment features
  sentimentScore: number;
  sentimentLabel: string;
  confidence: number;
  
  // Technical indicators - Momentum
  rsi14?: number;
  macdHistogram?: number;
  
  // Technical indicators - Trend
  priceToSma200Ratio?: number;
  priceToEma50Ratio?: number;
  
  // Technical indicators - Volatility
  volatilityAtr14?: number;
  bbWidth?: number;
  
  // Technical indicators - Liquidity
  volumeRatio24h?: number;
  
  // Market correlation
  btcPriceChange24h?: number;
  btcDominance?: number;
}

/**
 * SageMaker prediction output
 */
export interface PredictionOutput {
  // Predicted price return percentage
  predictedReturnPct: number;
  
  // Trading signal: BUY, SELL, NEUTRAL, or HOLD
  signal: 'BUY' | 'SELL' | 'NEUTRAL' | 'HOLD';
  
  // Reasoning/explanation for the prediction
  reasoning: string;
}

/**
 * Complete prediction result with metadata
 */
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
