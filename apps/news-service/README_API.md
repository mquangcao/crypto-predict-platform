# News Service - Multi-Source Crypto News with AI Sentiment Analysis

## 🚀 Tổng quan

Service thu thập tin tức crypto từ nhiều nguồn, phân tích sentiment bằng AI, và lưu trữ kèm giá coin tại thời điểm đó.

**Tính năng chính:**
- ✅ Multi-source: CryptoPanic API + CryptoCompare API
- ✅ AI Sentiment Analysis: Sử dụng thư viện `sentiment` (VADER-like)
- ✅ Database: SQLite lưu trữ persistent data
- ✅ Real-time coin prices: Lấy từ Binance API
- ✅ Smart caching: Database-based với 30 phút TTL
- ✅ Fallback strategy: 3 tầng (Primary → Fallback → Mock)

## 📦 Cài đặt

```bash
cd apps/news-service
npm install
```

**Dependencies:**
- `@nestjs/typeorm`, `typeorm`, `sqlite3` - Database
- `@nestjs/axios`, `axios` - HTTP requests
- `sentiment` - AI sentiment analysis
- `@nestjs/cache-manager` - Caching (optional Redis)

## 🏃 Chạy service

```bash
npm run start:dev
```

Service chạy tại: **http://localhost:3002**

Database file: `apps/news-service/news.db`

## 📡 API Endpoints

### GET /news

Lấy danh sách tin tức crypto với sentiment analysis

**Query Parameters:**
- `filter` (optional): Loại tin tức
  - `hot` (default) - Tin nóng
  - `rising` - Tin đang nổi
  - `bullish` - Tin tích cực
  - `bearish` - Tin tiêu cực
  
- `currencies` (optional): Lọc theo coin (VD: `BTC`, `ETH`)

**Examples:**
```bash
GET http://localhost:3002/news
GET http://localhost:3002/news?filter=hot
GET http://localhost:3002/news?filter=bullish&currencies=BTC
```

**Response:**
```json
[
  {
    "id": "12345",
    "title": "Bitcoin Surges Past $100K",
    "source": "CoinDesk",
    "time": "5 phút trước",
    "sentiment": "bullish",
    "url": "https://...",
    "published_at": "2025-12-13T10:00:00Z"
  }
]
```

## 🎯 Sentiment Analysis

### Phương pháp

Sử dụng **hybrid approach**:

1. **Text Analysis (70%)**
   - Library: `sentiment` (3000+ words lexicon)
   - Phân tích: title + body (500 chars)
   - Features: Negation handling, emphasis detection

2. **Vote Analysis (30%)**
   - Formula: `(upvotes - downvotes) / total_votes`
   - Range: -1 to +1

3. **Final Score**
   ```
   finalScore = (0.7 × textScore) + (0.3 × voteScore)
   ```

### Labels

- **positive** (bullish): score ≥ 0.05 hoặc có positive words
- **negative** (bearish): score ≤ -0.05 hoặc có negative words  
- **neutral**: score trong khoảng [-0.05, 0.05]

### Database Fields

Mỗi tin tức được lưu với:
- `sentiment_label`: positive/negative/neutral
- `sentiment_score`: -1.00 đến +1.00 (2 chữ số)

## 💾 Database Schema

**Table: `news`**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| title | text | Tiêu đề |
| source | string | Nguồn tin |
| url | string | Link gốc |
| published_at | datetime | Thời gian đăng |
| body | text | Nội dung |
| categories | text | Danh mục |
| sentiment_label | varchar(20) | positive/negative/neutral |
| sentiment_score | float | -1.00 đến +1.00 |
| btc_price | float | Giá BTC tại thời điểm |
| eth_price | float | Giá ETH tại thời điểm |
| coin_prices | json | Giá các coin khác |
| api_source | varchar(50) | cryptopanic/cryptocompare |
| created_at | datetime | Thời gian tạo |
| updated_at | datetime | Thời gian cập nhật |

## 🔄 Data Flow

```
Request
  ↓
Check Database (30 min cache)
  ↓ (miss)
CryptoPanic API
  ↓ (failed/quota)
CryptoCompare API
  ↓ (failed)
Static Fallback Data
  ↓
+ Fetch Coin Prices (Binance)
  ↓
+ AI Sentiment Analysis
  ↓
Save to Database
  ↓
Return Response
```

## 🔑 API Keys

**CryptoPanic:** `a92d121539f2bd95be1438a42fa0a9562be5e5da`
- Endpoint: `https://cryptopanic.com/api/v1/posts/`
- Rate limit: Limited requests

**CryptoCompare:** `bf2d8615fdcba7687b1926b118d2c93f2e5ce4e382e20e0fc5682b8af7add0b5`
- Endpoint: `https://min-api.cryptocompare.com/data/v2/news/`
- Auth: Header `authorization: Apikey {key}`

**Binance:** Public API (no key needed)
- Endpoint: `https://api.binance.com/api/v3/ticker/price`

## 📊 Monitoring

Service logs bao gồm:
- Database cache hits/misses
- API call status
- Sentiment analysis details
- Coin prices fetched
- Error fallback chains

Example log:
```
[NewsRepository] Sentiment: "Bitcoin Surges..." -> text_score: 0.523, vote_score: 0.750, final: 0.591, label: positive, pos_words: surge,high, neg_words: none
```

## 🛠️ Development

**Xóa database để reset:**
```bash
del apps\news-service\news.db
```

**View database:**
```bash
sqlite3 apps\news-service\news.db
.schema news
SELECT * FROM news LIMIT 5;
```

## 🎨 Customization

### Điều chỉnh sentiment thresholds

Edit `news.repository.ts`:
```typescript
if (finalScore >= 0.05) {  // Tăng/giảm ngưỡng
  label = 'positive';
}
```

### Thay đổi cache duration

Edit `cryptopanic.service.ts`:
```typescript
const dbNews = await this.newsRepository.getRecentNews(30); // phút
```
