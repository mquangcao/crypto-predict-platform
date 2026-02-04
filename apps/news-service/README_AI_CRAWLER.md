# News Service - AI-Powered Multi-Source Crawler

## 🌟 Tổng quan

News Service đã được nâng cấp với khả năng crawl tin tức từ nhiều nguồn khác nhau sử dụng **AI-based HTML parser**. Hệ thống tự động học cấu trúc HTML của mỗi trang và adapt khi structure thay đổi.

## 🚀 Tính năng mới

### 1. **AI-Powered HTML Parsing**

- Sử dụng GPT-4o-mini để tự động phân tích và trích xuất nội dung từ bất kỳ trang web nào
- Tự động học và lưu parsing patterns để tái sử dụng
- Xử lý thông minh khi HTML structure thay đổi

### 2. **Multi-Source Crawling**

Hỗ trợ crawl từ nhiều nguồn song song:

- ✅ CryptoCompare (API-based)
- ✅ CoinDesk
- ✅ CoinTelegraph
- ✅ Decrypt
- ✅ TheBlock
- ✅ Bitcoin.com

### 3. **Smart Pattern Caching**

- Lưu trữ HTML patterns đã học vào database
- Tracking success/failure rates
- Tự động fallback về AI khi pattern cũ không còn hoạt động
- Giảm 90% chi phí AI calls sau lần crawl đầu tiên

### 4. **Automatic Symbol Detection**

- Tự động detect cryptocurrency symbols (BTC, ETH, etc.) từ nội dung
- Mapping với Binance trading symbols

## 📦 Kiến trúc

```
news-service/
├── entities/
│   ├── news-article.entity.ts    # Lưu tin tức
│   └── html-pattern.entity.ts    # Lưu patterns đã học
├── services/
│   ├── news.service.ts                    # Main service, multi-source orchestration
│   ├── ai-html-parser.service.ts         # AI-based HTML parser
│   └── universal-web-crawler.service.ts  # Base crawler class
└── providers/
    ├── cryptocompare.service.ts          # API-based crawler
    ├── coindesk-crawler.service.ts       # Web crawler for CoinDesk
    ├── cointelegraph-crawler.service.ts  # Web crawler for CoinTelegraph
    ├── decrypt-crawler.service.ts        # Web crawler for Decrypt
    ├── theblock-crawler.service.ts       # Web crawler for TheBlock
    └── bitcoin-com-crawler.service.ts    # Web crawler for Bitcoin.com
```

## ⚙️ Cách hoạt động

### Flow tổng quan:

```
1. Cron Job (5 phút/lần)
   ↓
2. Crawl từ tất cả sources song song
   ↓
3. Với mỗi source:
   a. Lấy danh sách URLs bài viết (Playwright)
   b. Crawl từng bài viết:
      - Kiểm tra cached pattern trong DB
      - Nếu có pattern → dùng cheerio parse
      - Nếu không có/pattern fail → gọi AI parse
      - Lưu pattern mới vào DB
   ↓
4. Lưu articles vào database
   ↓
5. Trigger sentiment analysis + impact analysis
```

### AI Parser Flow:

```
HTML Input
   ↓
Clean HTML (remove scripts, styles)
   ↓
Send to GPT-4o-mini với prompt:
   "Extract article data + CSS selectors"
   ↓
Nhận response JSON:
   {
     data: { title, content, author, date, symbols },
     pattern: { titleSelector, contentSelector, ... }
   }
   ↓
Lưu pattern vào DB để tái sử dụng
```

## 🔧 Setup

### 1. Cài đặt dependencies

```bash
cd apps/news-service
npm install
```

### 2. Cấu hình Environment Variables

Thêm vào `.env`:

```bash
# OpenAI API (required for AI parsing)
OPENAI_API_KEY=sk-proj-xxx...

# Optional: CryptoCompare API
CRYPTOCOMPARE_API_KEY=your_key_here

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5435
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_DB_NAME=news_db

# AWS (for sentiment & impact analysis)
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
SQS_SENTIMENT_QUEUE_URL=https://sqs...
EVENTBRIDGE_ROLE_ARN=arn:aws:iam:...
```

### 3. Chạy migrations

Database sẽ tự động tạo tables khi `synchronize: true`:

- `news_article` - Lưu tin tức
- `html_pattern` - Lưu HTML patterns

### 4. Start service

```bash
npm run dev
```

## 📊 Monitoring & Logs

### Log structure:

```
⏰ Cron Job Started: Syncing News from Multiple Sources...
🚀 Starting crawl from coindesk
📄 Navigating to https://www.coindesk.com/livewire/
🔗 Found 10 article URLs
📰 Crawling article: https://...
📋 Using cached pattern for coindesk.com
✅ Crawled 8/10 articles from coindesk
📊 [coindesk] Result: 5 new saved, 3 duplicates skipped
✅ Cron Job Finished - All Sources Synced.
```

### Khi pattern thất bại:

```
⚠️ Cached pattern failed for coindesk.com, falling back to AI
🤖 Using AI to learn new pattern for coindesk.com
✅ Saved new pattern for coindesk.com
```

## 💰 Chi phí AI

### GPT-4o-mini pricing:

- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

### Ước tính:

- **Lần đầu crawl** (học pattern): ~$0.02 per article
- **Các lần sau** (dùng pattern): $0 (chỉ dùng cheerio)
- **Pattern fail** (HTML thay đổi): ~$0.02 per article

**Chi phí dự kiến**: ~$1-2/tháng cho 5 sources × 10 articles/source × 2 lần học pattern/tháng

## 🔄 Thêm nguồn mới

### Cách thêm một news source mới:

1. Tạo file provider mới:

```typescript
// apps/news-service/src/news/providers/example-crawler.service.ts
import { Injectable } from '@nestjs/common';
import {
  UniversalWebCrawlerService,
  WebSource,
} from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class ExampleCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'example',
      domain: 'example.com',
      newsListUrl: 'https://example.com/news',
      articleLinkSelector: 'article a, .news-item a',
      maxArticles: 10,
      waitForSelector: 'article', // optional
    };

    super(source, aiParser);
  }
}
```

2. Thêm vào `news.module.ts`:

```typescript
const newsCrawlersProvider = {
  provide: 'NEWS_CRAWLERS',
  useFactory: (aiParser: AiHtmlParserService) => {
    return [
      // ... existing crawlers
      new ExampleCrawlerService(aiParser),
    ];
  },
  inject: [AiHtmlParserService],
};
```

**Xong!** Service sẽ tự động crawl từ nguồn mới.

## 🛠️ Troubleshooting

### Lỗi: "OpenAI API error: 401"

→ Kiểm tra `OPENAI_API_KEY` trong `.env`

### Lỗi: "Playwright browser not found"

→ Chạy: `npx playwright install chromium`

### Pattern không work với một số pages

→ Bình thường! AI sẽ tự động học lại pattern mới

### Crawl quá chậm

→ Giảm `maxArticles` trong WebSource config

## 🔐 Security Notes

- API keys được lưu trong environment variables
- Playwright chạy headless mode
- Rate limiting: 1 second giữa mỗi request
- HTML được sanitize trước khi lưu DB

## 📈 Future Improvements

- [ ] Thêm Anthropic Claude support (alternative to OpenAI)
- [ ] Implement retry logic với exponential backoff
- [ ] Add metrics tracking (crawl success rate, AI usage)
- [ ] Support RSS feeds
- [ ] Add webhook notifications khi có breaking news
- [ ] Implement distributed crawling với message queue

## 📝 API Endpoints

Unchanged - tất cả endpoints cũ vẫn hoạt động:

- `GET /news` - Lấy danh sách news
- `GET /news/:id` - Lấy chi tiết 1 news
- `GET /news/symbol/:symbol` - Lấy news theo symbol

## 🎯 Performance

- **Crawl speed**: ~1-2 articles/second per source
- **AI parsing**: ~2-3 seconds/article (first time)
- **Pattern-based parsing**: ~100ms/article (cached)
- **Cron frequency**: Every 5 minutes
- **Expected articles/day**: ~1000-2000 articles

---

Made with ❤️ for crypto news aggregation
