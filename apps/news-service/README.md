# News Service

A cryptocurrency news aggregation service that scrapes and serves news from CryptoCompare with sentiment analysis.

## 🚀 Features

- **Web Scraping**: Uses Playwright to scrape latest crypto news from CryptoCompare website
- **API Fallback**: Automatically falls back to CryptoCompare API if scraping fails
- **Sentiment Analysis**: Keyword-based sentiment calculation (bullish/bearish/neutral)
- **Scheduled Updates**: Automatically fetches news every 30 minutes via cron job
- **SQLite Database**: Persistent storage with TypeORM
- **Pagination Support**: API với phân trang và filter theo sentiment
- **RESTful API**: Clean API endpoints cho frontend

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Database**: SQLite + TypeORM
- **Web Scraping**: Playwright (Chromium headless browser)
- **Scheduling**: @nestjs/schedule (Cron jobs)
- **HTTP Client**: Axios

## 📊 Database Schema

### Table: `news`

| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar (PK) | Unique ID từ CryptoCompare |
| `title` | text | Tiêu đề tin tức |
| `source` | varchar | Nguồn tin (CoinDesk, Cointelegraph...) |
| `url` | varchar | Link bài viết gốc |
| `published_at` | datetime (indexed) | Thời gian xuất bản |
| `body` | text (nullable) | Nội dung/mô tả tin |
| `categories` | text (nullable) | Danh mục (BTC\|MARKET\|TRADING) |
| `api_source` | varchar(50) | Nguồn API: 'cryptocompare' |
| `sentiment_from_source` | varchar(50) (nullable) | Sentiment đã tính: bullish/bearish/neutral |
| `created_at` | datetime | Thời gian tạo record |
| `updated_at` | datetime | Thời gian update record |

## 🔄 Luồng Hoạt Động (Data Flow)

### 1. **Thu thập tin tức** (News Collection)

```
Khởi động / Mỗi 30 phút (Cron)
    ↓
NewsService.fetchAndSaveNews()
    ↓
CryptoCompareService.getNews()
    ├─→ [TRY] Scrape từ website (Playwright)
    │   ├─ Launch Chromium browser
    │   ├─ Navigate: cryptocompare.com/news
    │   ├─ Extract: title, url, source, body, sentiment
    │   └─ Return scraped data
    │
    └─→ [FALLBACK] CryptoCompare API (nếu scrape fail)
        ├─ GET /data/v2/news/?lang=EN
        ├─ Transform API response
        └─ Calculate sentiment từ keywords
    ↓
Transform data (chuẩn hóa format)
    ├─ Tính sentiment nếu chưa có (calculateSentiment)
    ├─ Format: id, title, source, url, published_at, body
    └─ sentiment_from_source: bullish/bearish/neutral
    ↓
NewsRepository.saveNews()
    ├─ Check tin đã tồn tại? (by ID)
    ├─ → Update nếu có
    └─ → Insert nếu chưa
    ↓
Lưu vào SQLite DB (news.db)
```

### 2. **Tính Sentiment** (Sentiment Calculation)

**Khi nào tính?** Ngay khi fetch dữ liệu (trước khi lưu DB)

**Hàm**: `CryptoCompareService.calculateSentiment(title, body)`

**Logic**:
```
1. Nếu website có sẵn sentiment → Dùng luôn
2. Nếu không:
   a. Ghép title + body thành text
   b. Lowercase để so sánh
   c. Đếm bullish keywords (+1 mỗi từ)
      - surge, rally, bullish, gains, rise, moon, pump, 
        breakthrough, adoption, tăng, tích cực...
   d. Đếm bearish keywords (-1 mỗi từ)
      - crash, dump, bearish, fall, drop, hack, 
        scam, regulation, giảm, tiêu cực...
   e. Tính điểm:
      - Score > 0 → "bullish"
      - Score < 0 → "bearish"
      - Score = 0 → "neutral"
```

**Kết quả**: Lưu vào `sentiment_from_source` trong DB

### 3. **API Query** (Frontend Request)

```
Frontend gọi API
    ↓
GET /news?page=1&limit=10&sentiment=positive
    ↓
NewsController.getNews()
    ├─ Parse query params
    ├─ Có sentiment filter?
    │   ├─ YES → NewsService.getNewsBySentiment()
    │   └─ NO  → NewsService.getLatestNews()
    ↓
NewsRepository.getNewsPaginated() hoặc
NewsRepository.getNewsBySentimentPaginated()
    ├─ Map sentiment: positive→bullish, negative→bearish
    ├─ Query DB với WHERE clause (fast!)
    ├─ ORDER BY published_at DESC
    ├─ LIMIT & OFFSET (phân trang)
    └─ Transform: Entity → DTO
    ↓
entityToDto()
    ├─ Đọc sentiment_from_source từ DB
    ├─ Format time: "5 phút trước", "2 giờ trước"
    └─ Return NewsItemDto
    ↓
Response JSON
{
  data: [...],
  total: 100,
  page: 1,
  totalPages: 10
}
```

## 📡 API Endpoints

### GET /news

Lấy danh sách tin tức với phân trang và filter

**Query Parameters:**
- `page` (optional): Số trang, default = 1
- `limit` (optional): Số tin/trang, default = 10
- `sentiment` (optional): Filter theo sentiment
  - `positive` - Tin tích cực (bullish)
  - `negative` - Tin tiêu cực (bearish)
  - `neutral` - Tin trung lập

**Examples:**
```bash
# Tất cả tin tức
GET http://localhost:3002/news

# Phân trang
GET http://localhost:3002/news?page=2&limit=20

# Chỉ tin bullish
GET http://localhost:3002/news?sentiment=positive

# Kết hợp
GET http://localhost:3002/news?page=1&limit=15&sentiment=negative
```

**Response:**
```json
{
  "data": [
    {
      "id": "12345",
      "title": "Bitcoin Surges Past $100K as Institutions Pile In",
      "source": "Cointelegraph",
      "time": "5 phút trước",
      "sentiment": "bullish",
      "url": "https://cointelegraph.com/...",
      "published_at": "2025-12-22T10:30:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

## 🏗️ Architecture

### Services Overview

1. **NewsService** - Business logic orchestrator
   - Quản lý cron jobs (mỗi 30 phút)
   - Điều phối flow thu thập tin tức
   
2. **CryptoCompareService** - Data integration
   - Gọi scraper hoặc API
   - Transform và tính sentiment
   
3. **CryptoCompareScraperService** - Web scraping
   - Playwright automation
   - Parse HTML từ CryptoCompare website
   
4. **NewsRepository** - Data access layer
   - CRUD operations với DB
   - Query với pagination và filter
   
5. **NewsController** - REST API endpoints
   - Handle HTTP requests
   - Validation và response formatting

### Project Structure

```
src/
├── news/
│   ├── entities/
│   │   └── news.entity.ts               # TypeORM entity
│   ├── dto/
│   │   └── news.dto.ts                  # Data transfer objects
│   ├── cryptocompare.service.ts         # API/Scraping integration
│   ├── cryptocompare-scraper.service.ts # Playwright scraper
│   ├── news.repository.ts               # Database queries
│   ├── news.service.ts                  # Business logic
│   ├── news.controller.ts               # REST API endpoints
│   └── news.module.ts                   # Module dependencies
├── app.module.ts
└── main.ts                              # Bootstrap (port 3002)
```

## 💻 Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## 🏃 Running the Service

```bash
# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

**Service runs on**: `http://localhost:3002`

**Database file**: `apps/news-service/news.db`

## ⚙️ Configuration

Không cần file `.env`. API key đã được hardcode trong code:

- **Port**: 3002 (định nghĩa trong `main.ts`)
- **CryptoCompare API Key**: Có sẵn trong `cryptocompare.service.ts`
- **Database**: SQLite file `news.db` (auto-created)
- **Cron Schedule**: `0 */30 * * * *` (mỗi 30 phút)

## 🧪 Testing

```bash
# Test API endpoints
curl http://localhost:3002/news
curl http://localhost:3002/news?sentiment=positive&page=1&limit=5

# Check database
sqlite3 news.db "SELECT id, title, sentiment_from_source FROM news LIMIT 5;"
```

## 🔧 Troubleshooting

### 1. Playwright/Chromium Issues

**Problem**: Chromium không download được

```bash
# Windows PowerShell
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="0"
npx playwright install chromium

# Hoặc cài thủ công
npx playwright install chromium --force
```

### 2. Scraping Returns Empty

**Nguyên nhân**:
- CryptoCompare thay đổi cấu trúc HTML
- Network/firewall chặn
- Cloudflare protection

**Giải pháp**: Service tự động fallback sang API, kiểm tra logs

### 3. Database Locked

**Problem**: `SQLITE_BUSY: database is locked`

```bash
# Stop tất cả instances
taskkill /F /IM node.exe

# Xóa DB và restart (mất dữ liệu!)
rm news.db
npm run start:dev
```

### 4. Port Already in Use

**Problem**: Port 3002 đã được dùng

```powershell
# Tìm process đang dùng port
netstat -ano | findstr :3002

# Kill process (thay PID)
taskkill /PID <PID> /F
```

## 🚀 Performance Tips

1. **Database Index**: Đã có index trên `published_at` và `sentiment_from_source`
2. **Query Optimization**: Dùng `findAndCount` với WHERE thay vì load all
3. **Pagination**: Luôn dùng `limit` để tránh load quá nhiều tin
4. **Caching**: Database là cache layer (30 phút TTL)

## 📝 Development Notes

### Thêm nguồn tin mới

1. Tạo service mới: `src/news/other-source.service.ts`
2. Implement scraping/API logic
3. Đăng ký trong `news.module.ts`:
   ```typescript
   providers: [..., OtherSourceService]
   ```
4. Gọi trong `NewsService.fetchAndSaveNews()`

### Thay đổi logic sentiment

Edit `CryptoCompareService.calculateSentiment()`:
- Thêm/bớt keywords
- Thay đổi scoring algorithm
- Tích hợp ML model (future)

## 📚 Dependencies

```json
{
  "@nestjs/common": "^11.x",
  "@nestjs/typeorm": "^10.x",
  "@nestjs/schedule": "^4.x",
  "typeorm": "^0.3.x",
  "sqlite3": "^5.x",
  "playwright": "^1.x",
  "axios": "^1.x"
}
```

## 📄 License

MIT

## 🤝 Support

Có vấn đề? Mở issue trên GitHub repository.

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Port**: 3002
