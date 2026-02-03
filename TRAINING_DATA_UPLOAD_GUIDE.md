# Training Data Upload to S3 for SageMaker

## 📋 Prerequisites

### 1. AWS Credentials Setup

Bạn cần AWS Access Key và Secret Key với permissions cho S3:

**Option 1: IAM User (Recommended for testing)**

1. Tạo IAM User với policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::crypto-news-datalake-training",
        "arn:aws:s3:::crypto-news-datalake-training/*"
      ]
    }
  ]
}
```

2. Tạo Access Key cho user này

**Option 2: LocalStack (For local testing)**

```bash
# Nếu muốn test local không cần AWS account
docker run -d -p 4566:4566 localstack/localstack
```

### 2. S3 Bucket Setup

**Create bucket trên AWS:**

```bash
aws s3 mb s3://crypto-news-datalake-training --region ap-southeast-2
```

**Hoặc dùng AWS Console:**

1. S3 → Create bucket
2. Name: `crypto-news-datalake-training`
3. Region: `ap-southeast-2`
4. Block all public access: **Enabled** (for security)

### 3. Configure news-ai-service

**Edit `.env` file:**

```dotenv
# AWS Credentials
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# S3 Bucket
S3_TRAINING_BUCKET=crypto-news-datalake-training

# Enable training upload
TRAINING_UPLOAD_ENABLED=true
```

---

## 🚀 Upload Training Data

### Method 1: Manual Upload via API (Recommended for testing)

**1. Kiểm tra dataset stats:**

```bash
curl http://localhost:4004/training/stats
```

Response example:

```json
{
  "success": true,
  "data": {
    "totalRows": 1523,
    "symbolDistribution": {
      "BTCUSDT": 687,
      "ETHUSDT": 542,
      "BNBUSDT": 294
    },
    "timeframeDistribution": {
      "15m": 508,
      "1h": 512,
      "1d": 503
    },
    "dateRange": {
      "min": "2026-01-18T10:35:42.000Z",
      "max": "2026-01-27T15:11:18.000Z"
    }
  }
}
```

**2. Preview data trước khi upload:**

```bash
curl http://localhost:4004/training/preview?limit=10
```

**3. Upload toàn bộ data:**

```bash
curl -X POST http://localhost:4004/training/upload
```

Response:

```json
{
  "success": true,
  "message": "Training data uploaded successfully",
  "s3Uri": "s3://crypto-news-datalake-training/training-data/training-data-manual-2026-01-28.csv"
}
```

**4. Upload data trong khoảng thời gian:**

```bash
curl -X POST "http://localhost:4004/training/upload?startDate=2026-01-20&endDate=2026-01-27"
```

### Method 2: Scheduled Upload (Production)

Scheduler tự động chạy:

- **Daily**: 2 AM mỗi ngày (upload yesterday's data)
- **Weekly**: 3 AM chủ nhật (upload full dataset)

Cron đã được config trong `training-data-scheduler.service.ts`.

---

## 📊 Verify Upload trên S3

### Check files on S3:

```bash
aws s3 ls s3://crypto-news-datalake-training/training-data/ --recursive
```

Expected output:

```
2026-01-28 10:30:00   524288 training-data/training-data-manual-2026-01-28.csv
2026-01-28 10:30:01     2048 training-data/stats-manual-2026-01-28.json
```

### Download file để verify:

```bash
aws s3 cp s3://crypto-news-datalake-training/training-data/training-data-manual-2026-01-28.csv ./
```

---

## 🔧 File Structure trong S3

```
s3://crypto-news-datalake-training/
├── training-data/
│   ├── training-data-manual-2026-01-28.csv      # Training data
│   ├── stats-manual-2026-01-28.json              # Dataset statistics
│   ├── training-data-daily-2026-01-27.csv        # Daily incremental
│   └── training-data-full-2026-01-26.csv         # Weekly full snapshot
```

---

## 📈 CSV Format

CSV file có các columns sau:

### Features (Input):

- **News metadata**: newsId, symbol, timeframe
- **Sentiment**: sentimentScore, sentimentLabel, confidence
- **Momentum**: rsi14, macdHistogram
- **Trend**: priceToSma200Ratio, priceToEma50Ratio
- **Volatility**: volatilityAtr14, bbWidth
- **Liquidity**: volumeRatio24h
- **Market correlation**: btcPriceChange24h, btcDominance

### Target (Output):

- **returnPct**: Giá thay đổi bao nhiêu % sau tin tức (label chính)
- **maxDrawdownPct**: Drawdown tối đa
- **maxRunupPct**: Runup tối đa

Example row:

```csv
newsId,symbol,timeframe,sentimentScore,sentimentLabel,returnPct,rsi14,...
42a29532-...,BTCUSDT,1h,0.85,positive,2.35,65.4,...
```

---

## 🧪 Testing with SageMaker

### 1. Create SageMaker Notebook Instance

```bash
# Hoặc dùng AWS Console: SageMaker → Notebook instances → Create
```

### 2. Read data từ S3 trong notebook:

```python
import pandas as pd
import boto3

# Read CSV from S3
s3_uri = 's3://crypto-news-datalake-training/training-data/training-data-manual-2026-01-28.csv'
df = pd.read_csv(s3_uri)

print(f"Dataset shape: {df.shape}")
print(df.head())

# Check target distribution
print(df['returnPct'].describe())
```

### 3. Train model với SageMaker XGBoost:

```python
from sagemaker import get_execution_role
from sagemaker.inputs import TrainingInput
import sagemaker

role = get_execution_role()
session = sagemaker.Session()

# Feature columns
feature_cols = [
    'sentimentScore', 'rsi14', 'macdHistogram',
    'priceToSma200Ratio', 'volatilityAtr14', ...
]

# Prepare data
X = df[feature_cols]
y = df['returnPct']

# Upload to S3 for training
train_path = session.upload_data(
    path='train.csv',
    bucket='crypto-news-datalake-training',
    key_prefix='sagemaker/train'
)

# Use XGBoost container
from sagemaker.xgboost import XGBoost

xgb = XGBoost(
    entry_point='train.py',
    role=role,
    instance_count=1,
    instance_type='ml.m5.xlarge',
    framework_version='1.5-1'
)

xgb.fit({'train': TrainingInput(train_path, content_type='text/csv')})
```

---

## 🐛 Troubleshooting

### Error: "Access Denied"

```
✅ Fix: Check IAM permissions, verify bucket name và region
```

### Error: "No training data available"

```
✅ Fix: Chạy news-service để crawl news → đợi impact analysis chạy
✅ Check database: SELECT COUNT(*) FROM news_price_impact;
```

### Error: "Bucket does not exist"

```bash
# Create bucket:
aws s3 mb s3://crypto-news-datalake-training --region ap-southeast-2
```

---

## 📝 Next Steps

1. ✅ Upload training data lên S3
2. ✅ Verify files trong S3 bucket
3. ✅ Tạo SageMaker notebook instance
4. ✅ Train XGBoost model với data
5. ✅ Deploy model endpoint
6. ✅ Integrate prediction API với news-ai-service
