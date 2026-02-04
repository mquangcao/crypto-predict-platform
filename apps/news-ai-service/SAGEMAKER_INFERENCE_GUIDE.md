# SageMaker Inference Integration

## 📋 Tổng quan

News-AI Service đã được tích hợp với SageMaker inference endpoint `crypto-price-predictor-v1` để lấy predictions về giá cryptocurrency dựa trên sentiment và technical indicators.

---

## 🏗️ Kiến trúc

### Files đã tạo:

```
apps/news-ai-service/src/training/
├── controllers/
│   └── prediction.controller.ts          # API endpoints cho predictions
├── services/
│   └── sagemaker-inference.service.ts    # Service kết nối SageMaker
├── providers/
│   └── aws-sagemaker-client.provider.ts  # AWS SageMaker client provider
└── interfaces/
    └── prediction.interface.ts           # TypeScript interfaces
```

### Flow:

```
Client Request
    ↓
PredictionController
    ↓
SageMakerInferenceService
    ↓
AWS SageMaker Runtime Client
    ↓
SageMaker Endpoint (crypto-price-predictor-v1)
    ↓
Prediction Response
```

---

## ⚙️ Configuration

### 1. Environment Variables

Thêm vào `.env`:

```bash
# AWS Credentials (same as S3)
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SageMaker Endpoint
SAGEMAKER_ENDPOINT_NAME=crypto-price-predictor-v1
```

### 2. Config File

Đã update `apps/news-ai-service/config/default.js`:

```javascript
aws: {
  region: 'ap-southeast-2',
  sagemaker: {
    endpointName: 'crypto-price-predictor-v1',
  },
}
```

---

## 🚀 Cài đặt Dependencies

```bash
cd apps/news-ai-service
npm install @aws-sdk/client-sagemaker-runtime
```

Hoặc từ root của monorepo:

```bash
npm install --workspace=news-ai-service @aws-sdk/client-sagemaker-runtime
```

---

## 📡 API Endpoints

### 1. Single Prediction

**POST** `/prediction`

Request body:

```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "sentimentScore": 0.75,
  "sentimentLabel": "positive",
  "confidence": 0.85,
  "rsi14": 65.5,
  "macdHistogram": 12.3,
  "priceToSma200Ratio": 1.05,
  "volatilityAtr14": 0.023,
  "volumeRatio24h": 1.2,
  "btcPriceChange24h": 2.5,
  "btcDominance": 48.5
}
```

Response:

```json
{
  "success": true,
  "prediction": {
    "predictedReturnPct": 2.34,
    "predictedMaxDrawdownPct": -1.2,
    "predictedMaxRunupPct": 3.5
  },
  "input": { ... },
  "metadata": {
    "endpointName": "crypto-price-predictor-v1",
    "timestamp": "2026-02-01T10:30:00.000Z",
    "latencyMs": 245
  }
}
```

### 2. Batch Prediction

**POST** `/prediction/batch`

Request body:

```json
{
  "inputs": [
    {
      "symbol": "BTCUSDT",
      "timeframe": "1h",
      "sentimentScore": 0.75,
      "sentimentLabel": "positive",
      "confidence": 0.85
    },
    {
      "symbol": "ETHUSDT",
      "timeframe": "1h",
      "sentimentScore": -0.3,
      "sentimentLabel": "negative",
      "confidence": 0.72
    }
  ]
}
```

Response:

```json
{
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "success": true,
      "prediction": { "predictedReturnPct": 2.34 },
      "input": { ... },
      "metadata": { ... }
    },
    {
      "success": true,
      "prediction": { "predictedReturnPct": -1.52 },
      "input": { ... },
      "metadata": { ... }
    }
  ]
}
```

### 3. Quick Prediction (Simplified)

**GET** `/prediction/quick?symbol=BTCUSDT&sentiment=0.75&rsi=65&macd=12.3`

Query parameters:

- `symbol` (default: BTCUSDT)
- `timeframe` (default: 1h)
- `sentiment` (required)
- `rsi` (optional)
- `macd` (optional)

Response: Same as single prediction

### 4. Health Check

**GET** `/prediction/health`

Response:

```json
{
  "service": "SageMaker Inference",
  "status": "healthy",
  "endpoint": "crypto-price-predictor-v1",
  "timestamp": "2026-02-01T10:30:00.000Z"
}
```

---

## 🧪 Testing

### 1. Health Check

```bash
curl http://localhost:4004/prediction/health
```

### 2. Quick Test

```bash
curl "http://localhost:4004/prediction/quick?symbol=BTCUSDT&sentiment=0.75&rsi=65"
```

### 3. Full Prediction

```bash
curl -X POST http://localhost:4004/prediction \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "timeframe": "1h",
    "sentimentScore": 0.75,
    "sentimentLabel": "positive",
    "confidence": 0.85,
    "rsi14": 65.5,
    "macdHistogram": 12.3
  }'
```

### 4. Batch Prediction

```bash
curl -X POST http://localhost:4004/prediction/batch \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [
      {
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "sentimentScore": 0.75,
        "sentimentLabel": "positive",
        "confidence": 0.85
      },
      {
        "symbol": "ETHUSDT",
        "timeframe": "1h",
        "sentimentScore": -0.3,
        "sentimentLabel": "negative",
        "confidence": 0.72
      }
    ]
  }'
```

---

## 🔧 Service Features

### SageMakerInferenceService

**Methods:**

1. **`predict(features)`** - Single prediction
2. **`batchPredict(featuresArray)`** - Batch predictions with concurrency control
3. **`healthCheck()`** - Endpoint health check

**Features:**

- ✅ Automatic response format detection
- ✅ Support multiple SageMaker response formats
- ✅ Error handling and logging
- ✅ Performance tracking (latency)
- ✅ Batch processing with concurrency limit

**Supported Response Formats:**

```javascript
// Format 1: Direct number
2.34

// Format 2: Predictions array
{ "predictions": [2.34, -1.2, 3.5] }

// Format 3: Named fields
{
  "predictedReturnPct": 2.34,
  "predictedMaxDrawdownPct": -1.2,
  "predictedMaxRunupPct": 3.5
}

// Format 4: Single prediction field
{ "prediction": 2.34 }
```

---

## 📊 Input Features

### Required:

- `symbol`: Trading pair (e.g., "BTCUSDT")
- `timeframe`: Time interval (e.g., "1h", "15m", "1d")
- `sentimentScore`: Sentiment score (-1 to 1)
- `sentimentLabel`: "positive", "negative", or "neutral"
- `confidence`: Confidence score (0 to 1)

### Optional Technical Indicators:

- `rsi14`: RSI 14-period
- `macdHistogram`: MACD histogram
- `priceToSma200Ratio`: Price to SMA200 ratio
- `priceToEma50Ratio`: Price to EMA50 ratio
- `volatilityAtr14`: ATR volatility
- `bbWidth`: Bollinger Bands width
- `volumeRatio24h`: 24h volume ratio
- `btcPriceChange24h`: Bitcoin 24h price change
- `btcDominance`: Bitcoin dominance percentage

---

## 🎯 Use Cases

### 1. Real-time News Impact Prediction

Khi có tin tức mới:

1. Sentiment service phân tích sentiment
2. Impact service tính technical indicators
3. Prediction service lấy prediction từ SageMaker
4. Kết quả được gửi cho client/frontend

### 2. Batch Analysis

Phân tích nhiều tin tức cùng lúc để tìm opportunities:

```typescript
const predictions = await sageMakerService.batchPredict(newsFeatures);
const opportunities = predictions
  .filter((p) => p.success && p.prediction.predictedReturnPct > 2)
  .sort(
    (a, b) => b.prediction.predictedReturnPct - a.prediction.predictedReturnPct,
  );
```

### 3. Backtesting

Test model performance trên historical data:

```typescript
const historicalFeatures = await trainingService.exportTrainingData();
const predictions = await sageMakerService.batchPredict(historicalFeatures);
// Compare predictions vs actual returns
```

---

## 🔐 Security & Best Practices

### 1. AWS Credentials

- Không commit credentials vào git
- Sử dụng IAM role khi deploy lên EC2/ECS
- Minimum permissions:
  ```json
  {
    "Effect": "Allow",
    "Action": ["sagemaker:InvokeEndpoint"],
    "Resource": "arn:aws:sagemaker:*:*:endpoint/crypto-price-predictor-v1"
  }
  ```

### 2. Error Handling

Service tự động handle errors:

- Network errors
- Endpoint không available
- Invalid response format
- Timeout

### 3. Performance

- Batch predictions: max 10 concurrent requests
- Latency tracking included
- Health check endpoint để monitor

---

## 🐛 Troubleshooting

### Issue: "Endpoint not found"

```bash
# Verify endpoint exists
aws sagemaker describe-endpoint --endpoint-name crypto-price-predictor-v1

# Check endpoint status
aws sagemaker describe-endpoint --endpoint-name crypto-price-predictor-v1 \
  --query 'EndpointStatus'
```

### Issue: "Invalid response format"

Check logs để xem response format từ SageMaker, rồi update `parseResponse()` method nếu cần.

### Issue: "Access denied"

Verify IAM permissions:

```bash
aws sagemaker invoke-endpoint \
  --endpoint-name crypto-price-predictor-v1 \
  --body '{"test": "data"}' \
  --content-type application/json \
  output.json
```

---

## 📝 Next Steps

### TODO:

1. ✅ Implement basic prediction API
2. ✅ Add batch prediction support
3. ✅ Add health check endpoint
4. 🔲 Implement `GET /prediction/news/:newsId` endpoint
5. 🔲 Add caching layer (Redis) for frequent predictions
6. 🔲 Add metrics/monitoring (CloudWatch, Prometheus)
7. 🔲 Implement A/B testing between model versions
8. 🔲 Add rate limiting
9. 🔲 Create automated backtesting pipeline

### Integration Points:

- [ ] Connect với News Service để auto-predict on new news
- [ ] Integrate với Frontend để show predictions
- [ ] Add WebSocket support cho real-time predictions
- [ ] Create dashboard để visualize prediction accuracy

---

## 📚 References

- [AWS SageMaker Runtime API](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpoint.html)
- [SageMaker Endpoints](https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-deployment.html)
- [NestJS Documentation](https://docs.nestjs.com/)
