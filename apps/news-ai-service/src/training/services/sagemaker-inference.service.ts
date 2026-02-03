import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
  InvokeEndpointCommandInput,
} from '@aws-sdk/client-sagemaker-runtime';
import { getConfig } from '@app/common';
import { AWS_SAGEMAKER_CLIENT } from '../providers/aws-sagemaker-client.provider';
import {
  PredictionFeatures,
  PredictionOutput,
  PredictionResult,
} from '../interfaces/prediction.interface';

@Injectable()
export class SageMakerInferenceService {
  private readonly logger = new Logger(SageMakerInferenceService.name);
  private readonly endpointName: string;

  constructor(
    @Inject(AWS_SAGEMAKER_CLIENT)
    private readonly sageMakerClient: SageMakerRuntimeClient,
  ) {
    const sagemakerConfig = getConfig('aws.sagemaker');
    this.endpointName = sagemakerConfig?.endpointName || 'crypto-price-predictor-v1';
    this.logger.log(`🤖 SageMaker Inference Service initialized with endpoint: ${this.endpointName}`);
  }

  /**
   * Get price prediction from SageMaker endpoint
   */
  async predict(features: PredictionFeatures): Promise<PredictionResult> {
    const startTime = Date.now();

    try {
      this.logger.log(`🔮 Requesting prediction for ${features.symbol} ${features.timeframe}`);

      // Prepare input data for SageMaker
      const inputData = this.prepareInputData(features);

      // Call SageMaker endpoint
      const command = new InvokeEndpointCommand({
        EndpointName: this.endpointName,
        ContentType: 'application/json',
        Accept: 'application/json',
        Body: JSON.stringify(inputData),
      });

      const response = await this.sageMakerClient.send(command);

      // Parse response
      const bodyText = new TextDecoder().decode(response.Body);
      const prediction = this.parseResponse(bodyText);

      const latencyMs = Date.now() - startTime;

      this.logger.log(
        `✅ Prediction received: ${prediction.predictedReturnPct.toFixed(2)}% (${latencyMs}ms)`,
      );

      return {
        success: true,
        prediction,
        input: features,
        metadata: {
          endpointName: this.endpointName,
          timestamp: new Date().toISOString(),
          latencyMs,
        },
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`❌ Prediction failed: ${error.message}`, error.stack);

      return {
        success: false,
        input: features,
        metadata: {
          endpointName: this.endpointName,
          timestamp: new Date().toISOString(),
          latencyMs,
        },
        error: error.message,
      };
    }
  }

  /**
   * Batch prediction for multiple inputs
   */
  async batchPredict(featuresArray: PredictionFeatures[]): Promise<PredictionResult[]> {
    this.logger.log(`📦 Batch prediction for ${featuresArray.length} inputs`);

    // Process predictions in parallel (with reasonable concurrency limit)
    const batchSize = 10;
    const results: PredictionResult[] = [];

    for (let i = 0; i < featuresArray.length; i += batchSize) {
      const batch = featuresArray.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((features) => this.predict(features)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Prepare input data in the format expected by SageMaker model
   * Feature order must match the training data columns:
   * sentimentScore, confidence, rsi14, macdHistogram, priceToSma200Ratio, 
   * priceToEma50Ratio, volatilityAtr14, bbWidth, volumeRatio24h, 
   * btcPriceChange24h, btcDominance
   */
  private prepareInputData(features: PredictionFeatures): any {
    // Send only the feature columns in the exact order expected by the model
    // Do NOT include symbol, timeframe, or sentimentLabel
    // Missing values will be handled by the model's Pipeline (imputed with mean)
    return {
      sentimentScore: features.sentimentScore,
      confidence: features.confidence,
      rsi14: features.rsi14 ?? null,
      macdHistogram: features.macdHistogram ?? null,
      priceToSma200Ratio: features.priceToSma200Ratio ?? null,
      priceToEma50Ratio: features.priceToEma50Ratio ?? null,
      volatilityAtr14: features.volatilityAtr14 ?? null,
      bbWidth: features.bbWidth ?? null,
      volumeRatio24h: features.volumeRatio24h ?? null,
      btcPriceChange24h: features.btcPriceChange24h ?? null,
      btcDominance: features.btcDominance ?? null,
    };
  }

  /**
   * Parse SageMaker response
   * Expected format from inference.py:
   * {
   *   predictedReturnPct: number,
   *   signal: 'BUY' | 'SELL' | 'NEUTRAL',
   *   reasoning: string
   * }
   */
  private parseResponse(bodyText: string): PredictionOutput {
    try {
      const parsed = JSON.parse(bodyText);

      // Validate the expected format
      if (parsed.predictedReturnPct !== undefined && 
          parsed.signal !== undefined && 
          parsed.reasoning !== undefined) {
        return {
          predictedReturnPct: parsed.predictedReturnPct,
          signal: parsed.signal,
          reasoning: parsed.reasoning,
        };
      }

      // Fallback: if old format is detected, create a basic response
      if (typeof parsed === 'number') {
        return {
          predictedReturnPct: parsed,
          signal: parsed > 1.0 ? 'BUY' : (parsed < -1.0 ? 'SELL' : 'NEUTRAL'),
          reasoning: 'No reasoning provided by model',
        };
      }

      throw new Error('Invalid response format. Expected: {predictedReturnPct, signal, reasoning}');
    } catch (error) {
      this.logger.error(`Failed to parse response: ${bodyText}`);
      throw new Error(`Invalid response format: ${error.message}`);
    }
  }

  /**
   * Check if endpoint is available
   */
  async healthCheck(): Promise<{ healthy: boolean; endpointName: string; error?: string }> {
    try {
      // Try a simple prediction with dummy data
      const dummyFeatures: PredictionFeatures = {
        symbol: 'BTCUSDT',
        timeframe: '1h',
        sentimentScore: 0.5,
        sentimentLabel: 'neutral',
        confidence: 0.8,
        rsi14: 50,
        macdHistogram: 0,
      };

      const result = await this.predict(dummyFeatures);

      return {
        healthy: result.success,
        endpointName: this.endpointName,
        error: result.error,
      };
    } catch (error) {
      return {
        healthy: false,
        endpointName: this.endpointName,
        error: error.message,
      };
    }
  }
}
