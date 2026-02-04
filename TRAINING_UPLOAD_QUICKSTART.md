# Training Data Upload - Quick Start

## 🎯 Mục đích

Upload training data lên S3 để train model với AWS SageMaker

## ⚡ Quick Start (3 bước)

### 1️⃣ Setup AWS Credentials

**Tạo file `.env` trong `apps/news-ai-service/`:**

```bash
cd apps/news-ai-service
cp .env.example .env
```

**Edit `.env` với AWS credentials của bạn:**

```dotenv
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_TRAINING_BUCKET=crypto-news-datalake-training
TRAINING_UPLOAD_ENABLED=true
```

**Tạo S3 bucket (nếu chưa có):**

```bash
aws s3 mb s3://crypto-news-datalake-training --region ap-southeast-2
```

### 2️⃣ Test Upload

**Option 1: Dùng PowerShell script**

```powershell
.\scripts\test-training-upload.ps1
```

**Option 2: Manual test với curl**

```bash
# Check stats
curl http://localhost:4004/training/stats

# Upload
curl -X POST http://localhost:4004/training/upload
```

### 3️⃣ Verify trên S3

```bash
# List files
aws s3 ls s3://crypto-news-datalake-training/training-data/ --recursive

# Download để check
aws s3 cp s3://crypto-news-datalake-training/training-data/training-data-manual-2026-01-28.csv ./
```

---

## 📁 Files đã tạo

1. **Controller**: `apps/news-ai-service/src/training/controllers/training.controller.ts`
   - API endpoints: `/training/upload`, `/training/stats`, `/training/preview`

2. **Module updated**: `apps/news-ai-service/src/training/training.module.ts`
   - Đã add TrainingController

3. **Documentation**:
   - [TRAINING_DATA_UPLOAD_GUIDE.md](TRAINING_DATA_UPLOAD_GUIDE.md) - Chi tiết setup & troubleshooting
4. **Test script**: `scripts/test-training-upload.ps1`
   - Auto test stats → preview → upload

---

## 🔌 API Endpoints

### GET `/training/stats`

Xem thống kê dataset hiện tại

```json
{
  "totalRows": 1523,
  "symbolDistribution": {"BTCUSDT": 687, ...},
  "dateRange": {"min": "...", "max": "..."}
}
```

### GET `/training/preview?limit=10`

Xem 10 rows đầu tiên

### POST `/training/upload`

Upload toàn bộ data lên S3

### POST `/training/upload?startDate=2026-01-20&endDate=2026-01-27`

Upload data trong khoảng thời gian

---

## 📊 Data Format

CSV có các features:

**Input Features:**

- Sentiment: sentimentScore, sentimentLabel, confidence
- Momentum: rsi14, macdHistogram
- Trend: priceToSma200Ratio, priceToEma50Ratio
- Volatility: volatilityAtr14, bbWidth
- Market: btcPriceChange24h, btcDominance

**Target (Label):**

- returnPct (chính)
- maxDrawdownPct
- maxRunupPct

---

## 🧪 SageMaker Training

Sau khi upload, dùng notebook này trong SageMaker:

```python
import pandas as pd
import boto3

# Load data
df = pd.read_csv('s3://crypto-news-datalake-training/training-data/training-data-manual-2026-01-28.csv')

# Features
features = ['sentimentScore', 'rsi14', 'macdHistogram', 'priceToSma200Ratio', ...]
X = df[features]
y = df['returnPct']

# Train with XGBoost
from sagemaker.xgboost import XGBoost
# ... (see TRAINING_DATA_UPLOAD_GUIDE.md for full code)
```

---

## 🐛 Troubleshooting

**"Access Denied"**

- Kiểm tra AWS credentials trong `.env`
- Verify IAM policy có S3 PutObject permission

**"No training data"**

- Chạy news-service để crawl news
- Đợi impact analysis chạy (kiểm tra DB: `SELECT COUNT(*) FROM news_price_impact`)

**"Bucket not found"**

```bash
aws s3 mb s3://crypto-news-datalake-training --region ap-southeast-2
```

---

## 📅 Automatic Uploads (Production)

Scheduler tự động upload:

- **Daily**: 2 AM (yesterday's data)
- **Weekly**: 3 AM Sunday (full dataset)

Enable trong config: `TRAINING_UPLOAD_ENABLED=true`

---

## 📚 More Info

- Full guide: [TRAINING_DATA_UPLOAD_GUIDE.md](TRAINING_DATA_UPLOAD_GUIDE.md)
- Technical docs: [TECHNICAL_INDICATORS.md](apps/news-ai-service/TECHNICAL_INDICATORS.md)
