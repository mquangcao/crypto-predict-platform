# Training Data Upload System

## Tổng quan

Hệ thống tự động export training data (news sentiment + price impact) và upload lên S3 để AWS SageMaker sử dụng cho việc train model AI/ML.

## Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│              news-ai-service (Training Module)           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────┐            │
│  │  TrainingDataSchedulerService             │            │
│  │  - Daily upload (2 AM)                    │            │
│  │  - Weekly full export (Sunday 3 AM)       │            │
│  │  - Manual trigger                         │            │
│  └──────────────┬───────────────────────────┘            │
│                 │                                         │
│  ┌──────────────▼───────────────────────────┐            │
│  │  TrainingDataExportService                │            │
│  │  - JOIN news_sentiment + news_price_impact│            │
│  │  - Export to CSV format                   │            │
│  │  - Generate dataset statistics            │            │
│  └──────────────┬───────────────────────────┘            │
│                 │                                         │
│  ┌──────────────▼───────────────────────────┐            │
│  │  S3UploadService                          │            │
│  │  - Upload CSV files                       │            │
│  │  - Upload JSON metadata                   │            │
│  └──────────────┬───────────────────────────┘            │
│                 │                                         │
└─────────────────┼─────────────────────────────────────────┘
                  │
                  ▼
          ┌──────────────┐
          │   AWS S3      │
          │ Training Data │
          │   Bucket      │
          └───────┬───────┘
                  │
                  ▼
          ┌──────────────┐
          │ AWS SageMaker │
          │  AutoPilot    │
          └───────────────┘
```

## Data Schema

### Training Data CSV Format

| Column             | Type      | Description                    | Group      |
| ------------------ | --------- | ------------------------------ | ---------- |
| newsId             | string    | News article ID                | Metadata   |
| symbol             | string    | Trading pair (e.g., BTCUSDT)   | Metadata   |
| timeframe          | string    | Impact timeframe (15m, 1h, 1d) | Metadata   |
| **sentimentScore** | float     | -1 to +1                       | Feature    |
| **sentimentLabel** | string    | positive/neutral/negative      | Feature    |
| confidence         | float     | Sentiment confidence           | Feature    |
| **returnPct**      | float     | Price return %                 | **TARGET** |
| maxDrawdownPct     | float     | Max loss %                     | TARGET     |
| maxRunupPct        | float     | Max gain %                     | TARGET     |
| rsi14              | float     | RSI indicator                  | Feature    |
| macdHistogram      | float     | MACD momentum                  | Feature    |
| priceToSma200Ratio | float     | Price vs SMA200                | Feature    |
| priceToEma50Ratio  | float     | Price vs EMA50                 | Feature    |
| volatilityAtr14    | float     | ATR volatility                 | Feature    |
| bbWidth            | float     | Bollinger Bands width          | Feature    |
| volumeRatio24h     | float     | Volume spike ratio             | Feature    |
| btcPriceChange24h  | float     | BTC 24h change                 | Feature    |
| btcDominance       | float     | BTC dominance                  | Feature    |
| impactCreatedAt    | timestamp | Impact calculation time        | Metadata   |

**Total: 20 columns**

- 1 primary target (returnPct)
- 2 secondary targets (maxDrawdownPct, maxRunupPct)
- 14 features
- 3 metadata fields

## Upload Schedules

### 1. Daily Upload (Incremental)

- **Schedule**: Every day at 2:00 AM (Asia/Ho_Chi_Minh)
- **Data**: Previous day's data (yesterday 00:00 - 23:59)
- **Filename**: `training-data-daily-YYYY-MM-DD.csv`
- **Use case**: Continuous model retraining with fresh data

### 2. Weekly Full Export

- **Schedule**: Every Sunday at 3:00 AM
- **Data**: All historical data
- **Filename**: `training-data-full-YYYY-MM-DD.csv`
- **Use case**: Full model retraining, data validation

### 3. Manual Trigger

```typescript
// Via service injection
await trainingDataScheduler.uploadTrainingDataNow(startDate, endDate);
```

## Configuration

### Environment Variables

```bash
# AWS Credentials
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3 Bucket
S3_TRAINING_BUCKET=crypto-ml-training-data

# Enable/Disable automatic uploads
TRAINING_UPLOAD_ENABLED=true
```

### Config File (config/default.js)

```javascript
training: {
  uploadEnabled: process.env.TRAINING_UPLOAD_ENABLED === 'true',
  schedules: {
    daily: '0 2 * * *',  // 2 AM every day
    weekly: '0 3 * * 0', // 3 AM every Sunday
  },
},
aws: {
  s3: {
    trainingBucket: process.env.S3_TRAINING_BUCKET || 'crypto-ml-training-data',
  },
},
```

## S3 Bucket Structure

```
s3://crypto-ml-training-data/
├── training-data/
│   ├── training-data-daily-2026-01-15.csv
│   ├── training-data-daily-2026-01-16.csv
│   ├── training-data-full-2026-01-12.csv
│   ├── training-data-full-2026-01-19.csv
│   └── training-data-manual-2026-01-16.csv
│
└── stats/
    ├── stats-daily-2026-01-15.json
    ├── stats-daily-2026-01-16.json
    └── stats-full-2026-01-12.json
```

### Stats JSON Example

```json
{
  "totalRows": 1523,
  "dataRows": 1523,
  "dateRange": {
    "min": "2026-01-01T00:00:00.000Z",
    "max": "2026-01-15T23:59:59.000Z"
  },
  "symbolDistribution": {
    "BTCUSDT": 456,
    "ETHUSDT": 342,
    "BNBUSDT": 234,
    "SOLUSDT": 189
  },
  "sentimentDistribution": {
    "positive": 678,
    "neutral": 512,
    "negative": 333
  },
  "exportedAt": "2026-01-16T02:00:15.234Z",
  "startDate": "2026-01-15T00:00:00.000Z",
  "endDate": "2026-01-16T00:00:00.000Z"
}
```

## SageMaker Integration

### 1. Create SageMaker AutoPilot Job

```python
import boto3
import sagemaker

sagemaker_client = boto3.client('sagemaker')
bucket = 'crypto-ml-training-data'

# Input data from S3
input_data_config = [{
    'DataSource': {
        'S3DataSource': {
            'S3DataType': 'S3Prefix',
            'S3Uri': f's3://{bucket}/training-data/training-data-full-2026-01-19.csv'
        }
    },
    'TargetAttributeName': 'returnPct'
}]

# Output location
output_config = {
    'S3OutputPath': f's3://{bucket}/sagemaker-output/'
}

# Create AutoPilot job
response = sagemaker_client.create_auto_ml_job(
    AutoMLJobName='crypto-news-impact-predictor-v1',
    InputDataConfig=input_data_config,
    OutputDataConfig=output_config,
    ProblemType='Regression',
    AutoMLJobObjective={
        'MetricName': 'MSE'  # Mean Squared Error
    },
    RoleArn='arn:aws:iam::123456789012:role/SageMakerRole'
)
```

### 2. Feature Engineering in SageMaker

SageMaker AutoPilot sẽ tự động:

- Handle missing values (null indicators)
- Feature scaling (standardization)
- Feature selection (remove low-importance features)
- Model selection (Linear, XGBoost, Deep Learning)
- Hyperparameter tuning

### 3. Model Deployment

```python
# Deploy best model
predictor = sagemaker_client.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium',
    endpoint_name='crypto-news-impact-predictor'
)

# Predict
new_data = {
    'sentimentScore': 0.85,
    'sentimentLabel': 'positive',
    'rsi14': 68.5,
    'priceToSma200Ratio': 1.15,
    'volatilityAtr14': 2.3,
    'btcPriceChange24h': 3.2,
    # ... other features
}

prediction = predictor.predict(new_data)
print(f"Predicted returnPct: {prediction['returnPct']:.2f}%")
```

## Data Quality Checks

### Pre-upload Validation

```typescript
// In TrainingDataExportService
async validateData(data: TrainingDataRow[]): Promise<boolean> {
  // Check 1: Minimum rows
  if (data.length < 100) {
    this.logger.warn('⚠️ Insufficient data rows: ${data.length}');
    return false;
  }

  // Check 2: Feature completeness
  const nullRatio = data.reduce((sum, row) => {
    const nullCount = Object.values(row).filter(v => v === null).length;
    return sum + (nullCount / Object.keys(row).length);
  }, 0) / data.length;

  if (nullRatio > 0.5) {
    this.logger.warn('⚠️ Too many null values: ${(nullRatio * 100).toFixed(1)}%');
    return false;
  }

  // Check 3: Target distribution
  const avgReturn = data.reduce((sum, r) => sum + r.returnPct, 0) / data.length;
  const stdReturn = Math.sqrt(
    data.reduce((sum, r) => sum + Math.pow(r.returnPct - avgReturn, 2), 0) / data.length
  );

  if (stdReturn < 0.1) {
    this.logger.warn('⚠️ Target variance too low: ${stdReturn}');
    return false;
  }

  return true;
}
```

## Monitoring & Alerts

### CloudWatch Metrics

```typescript
// Add metrics to scheduler
import { CloudWatch } from '@aws-sdk/client-cloudwatch';

async uploadWithMetrics() {
  const cloudwatch = new CloudWatch({ region: 'ap-southeast-2' });

  const startTime = Date.now();
  const s3Uri = await this.exportAndUpload();
  const duration = Date.now() - startTime;

  await cloudwatch.putMetricData({
    Namespace: 'CryptoML/TrainingData',
    MetricData: [{
      MetricName: 'UploadDuration',
      Value: duration,
      Unit: 'Milliseconds',
      Timestamp: new Date(),
    }, {
      MetricName: 'UploadSuccess',
      Value: s3Uri ? 1 : 0,
      Unit: 'Count',
    }]
  });
}
```

### SNS Alerts (Optional)

```typescript
// Alert on upload failure
if (!s3Uri) {
  await sns.publish({
    TopicArn: 'arn:aws:sns:region:account:training-data-alerts',
    Subject: '❌ Training Data Upload Failed',
    Message: `Failed to upload training data at ${new Date().toISOString()}`,
  });
}
```

## Usage Examples

### Manual Export

```typescript
import { TrainingDataSchedulerService } from './training/services/training-data-scheduler.service';

// Export last 7 days
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const s3Uri = await schedulerService.uploadTrainingDataNow(startDate);
console.log(`Uploaded to: ${s3Uri}`);
```

### Check Dataset Stats

```typescript
import { TrainingDataExportService } from './training/services/training-data-export.service';

const stats = await exportService.getDatasetStats();
console.log(`
Total rows: ${stats.totalRows}
Date range: ${stats.dateRange.min} to ${stats.dateRange.max}
Symbols: ${Object.entries(stats.symbolDistribution)
  .map(([s, c]) => `${s}: ${c}`)
  .join(', ')}
Sentiments: ${Object.entries(stats.sentimentDistribution)
  .map(([l, c]) => `${l}: ${c}`)
  .join(', ')}
`);
```

## Troubleshooting

### Issue 1: No data exported

```
⚠️ No training data to upload
```

**Cause**: Chưa có data trong `news_price_impact` table hoặc không match với `news_sentiment`

**Solution**:

1. Kiểm tra SQS queues có hoạt động không
2. Verify impact analysis đã chạy
3. Check JOIN condition (newsId phải match)

### Issue 2: S3 upload failed

```
❌ Failed to upload to S3: AccessDenied
```

**Cause**: IAM credentials không đủ quyền

**Solution**: Add S3 policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::crypto-ml-training-data/*"
    }
  ]
}
```

### Issue 3: CSV formatting issues

**Cause**: Special characters trong text fields

**Solution**: Đã handle trong `convertToCSV()` - escape commas with quotes

## Best Practices

1. **Data Versioning**: Include timestamp in filename
2. **Incremental Updates**: Daily uploads để tiết kiệm storage
3. **Full Snapshots**: Weekly để có baseline
4. **Metadata**: Luôn upload stats JSON cùng CSV
5. **Monitoring**: Track upload success rate
6. **Cleanup**: Set S3 lifecycle policy để xóa files cũ > 90 days

## Next Steps

1. **Enable scheduler**: Set `TRAINING_UPLOAD_ENABLED=true`
2. **Create S3 bucket**: `aws s3 mb s3://crypto-ml-training-data`
3. **Configure IAM**: Add S3 permissions
4. **Test manual upload**: Call `uploadTrainingDataNow()`
5. **Monitor logs**: Check daily/weekly uploads
6. **Set up SageMaker**: Create AutoPilot job
7. **Deploy model**: Create prediction endpoint
8. **Integrate predictions**: Use in real-time news analysis
