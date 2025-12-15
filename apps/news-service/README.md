<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# News Service - Crypto Platform

Microservice quản lý tin tức crypto với tính năng sentiment analysis tự động, scheduler, và lưu trữ database.

## 🚀 Tổng quan

Service này cung cấp tin tức crypto từ **CryptoCompare API**, tự động phân tích sentiment (tích cực/tiêu cực/trung lập), lưu trữ vào SQLite database, và cung cấp RESTful API với pagination cho frontend.

## 🛠️ Công nghệ sử dụng

### Backend Framework & Core
- **NestJS 11.x** - Node.js framework hiện đại
- **TypeScript 5.7** - Ngôn ngữ lập trình
- **@nestjs/schedule 4.x** - Cron jobs để fetch tin tức định kỳ
- **@nestjs/axios** - HTTP client để gọi external APIs

### Database & ORM
- **SQLite 5.x** - Database nhẹ, không cần cài đặt server
- **TypeORM 0.3.x** - ORM cho TypeScript/JavaScript
- **Database file**: `news.db` (tự động tạo ở thư mục root)

### External APIs
- **CryptoCompare API** - Nguồn tin tức crypto chính
- **Binance API** - Lấy giá coin realtime (BTC, ETH, BNB)

### Sentiment Analysis
- **sentiment 5.0.2** - Library phân tích cảm xúc văn bản (VADER-like algorithm)

## 📊 Database Schema

### Table: `news`

| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar (PK) | ID tin tức từ CryptoCompare |
| `title` | text | Tiêu đề tin tức |
| `source` | varchar | Nguồn tin (ví dụ: CoinDesk, Cointelegraph) |
| `url` | varchar | Link gốc của tin tức |
| `published_at` | datetime (indexed) | Thời gian publish |
| `sentiment_label` | varchar(20) (indexed) | 'positive', 'negative', hoặc 'neutral' |
| `sentiment_score` | float | Điểm sentiment từ -1.0 đến +1.0 |
| `body` | text (nullable) | Nội dung/mô tả tin tức |
| `categories` | text (nullable) | Danh mục tin tức |
| `btc_price` | float (nullable) | Giá BTC lúc fetch |
| `eth_price` | float (nullable) | Giá ETH lúc fetch |
| `coin_prices` | json (nullable) | Object chứa giá các coin |
| `api_source` | varchar(50) | 'cryptocompare' |
| `created_at` | datetime | Thời gian tạo record |
| `updated_at` | datetime | Thời gian update record |

## 🧠 Sentiment Analysis

### Cách tính Sentiment Score

Service sử dụng thuật toán kết hợp:

1. **Text Analysis (70%)**: Sử dụng `sentiment` library phân tích keywords trong title và body
   - Từ tích cực: surge, rally, gains, bullish, rise, soar, breakthrough, adoption, positive, green...
   - Từ tiêu cực: crash, dump, bearish, fall, drop, loss, hack, exploit, warning, risk, ban...

2. **Vote Analysis (30%)**: Dựa trên upvotes/downvotes từ CryptoCompare
   - Vote ratio = (upvotes - downvotes) / total_votes

3. **Final Score** = (0.7 × text_sentiment) + (0.3 × vote_sentiment)
   - **Khoảng giá trị**: `-1.0` (cực kỳ tiêu cực) đến `+1.0` (cực kỳ tích cực)

### Phân loại Sentiment Label

| Score Range | Label | Màu hiển thị |
|-------------|-------|--------------|
| `>= 0.05` | **positive** (bullish) | 🟢 Xanh lá |
| `<= -0.05` | **negative** (bearish) | 🔴 Đỏ |
| `-0.05 < score < 0.05` | **neutral** | ⚪ Xám |

**Lưu ý**: Ngưỡng phân loại rất thấp (±0.05) để nhạy hơn với các từ khóa sentiment.

## ⏰ Scheduled Tasks

- **Fetch tin tức**: Tự động chạy **mỗi 30 phút** (`@Cron('0 */30 * * * *')`)
- **Khởi động ban đầu**: Fetch ngay khi service start
- **Log**: Ghi log mỗi lần fetch thành công/thất bại

## 🔌 API Endpoints

### Base URL: `http://localhost:3002`

#### 1. GET `/news` - Lấy danh sách tin tức (có phân trang)

**Query Parameters:**
- `page` (optional, default: 1) - Số trang
- `limit` (optional, default: 10) - Số tin mỗi trang
- `sentiment` (optional) - Lọc theo sentiment: 'positive' | 'negative' | 'neutral'

**Response:**
```json
{
  "data": [
    {
      "id": "123456",
      "title": "Bitcoin surges past $100K",
      "source": "CoinDesk",
      "url": "https://...",
      "published_at": "2025-12-16T10:30:00.000Z",
      "sentiment": "bullish",
      "time": "2 giờ trước"
    }
  ],
  "total": 145,
  "page": 1,
  "totalPages": 15
}
```

**Ví dụ:**
```bash
# Trang 1, 10 tin
curl http://localhost:3002/news?page=1&limit=10

# Chỉ tin tích cực
curl http://localhost:3002/news?sentiment=positive&page=1&limit=10
```

## 🖥️ Frontend Integration

### Trang News (`/news`)
- Hiển thị danh sách tin tức với layout card đẹp mắt
- Phân trang 10 tin/trang với nút "Trang trước/Trang sau"
- Click vào tin tức → Mở URL gốc trong tab mới
- Sentiment badge màu sắc theo label (xanh/đỏ/xám)
- Auto refresh mỗi 5 phút

### Components
- **Sidebar**: Menu điều hướng, click "Tin tức" → chuyển đến `/news`
- **Topbar**: Header chung
- **NewsList**: Component hiển thị danh sách tin tức (có pagination)

## 📦 Installation & Setup

```bash
# 1. Cài đặt dependencies
cd apps/news-service
npm install

# 2. Chạy development mode
npm run start:dev

# 3. Service sẽ chạy tại http://localhost:3002
```

**Lần chạy đầu tiên:**
- SQLite database `news.db` sẽ tự động được tạo
- Bảng `news` tự động sync schema (TypeORM `synchronize: true`)
- Tin tức sẽ được fetch ngay lập tức từ CryptoCompare

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── news/
│   ├── news.module.ts              # Module chính
│   ├── news.service.ts             # Logic fetch & schedule
│   ├── news.controller.ts          # REST endpoints
│   ├── news.repository.ts          # Database operations & sentiment
│   ├── cryptocompare.service.ts    # CryptoCompare API client
│   ├── coin-price.service.ts       # Binance price fetcher
│   ├── entities/
│   │   └── news.entity.ts          # TypeORM entity
│   └── dto/
│       └── news.dto.ts             # Data transfer objects
├── app.module.ts                   # Root module (ScheduleModule, TypeORM)
└── main.ts                         # Bootstrap

news.db                             # SQLite database file (auto-created)
```

## 🔑 Environment Variables

Không cần `.env` file cho development. Các config mặc định:

- **Port**: 3002
- **Database**: SQLite (`news.db`)
- **CryptoCompare API Key**: Hardcoded trong `cryptocompare.service.ts`
- **Cron schedule**: Mỗi 30 phút

## 🐛 Troubleshooting

### Lỗi: `Cannot find module '@nestjs/schedule'`
```bash
npm install @nestjs/schedule --legacy-peer-deps
```

### Database bị lock
```bash
# Xóa database và restart
rm news.db
npm run start:dev
```

### Không fetch được tin tức
- Kiểm tra kết nối internet
- Kiểm tra CryptoCompare API key còn hạn chưa
- Xem log trong console

## 📝 Changelog

**Version 2.0** (Current)
- ✅ Chỉ sử dụng CryptoCompare API (loại bỏ CryptoPanic)
- ✅ Scheduler fetch mỗi 30 phút
- ✅ Lưu tin tức vào SQLite database
- ✅ Sentiment analysis tự động với điểm số chi tiết
- ✅ API pagination
- ✅ Tích hợp coin prices từ Binance

**Version 1.0**
- Mock data & CryptoPanic API

## 📄 License

MIT licensed.
