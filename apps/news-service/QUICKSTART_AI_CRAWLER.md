# Quick Start Guide - AI-Powered News Crawler

## 🚀 Bắt đầu nhanh

### 1. Cài đặt OpenAI API Key

News service cần OpenAI API key để tự động parse HTML:

```bash
# Lấy API key tại: https://platform.openai.com/api-keys
# Thêm vào file .env trong root project:
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### 2. Cài đặt Playwright browsers

```bash
cd apps/news-service
npx playwright install chromium
```

### 3. Chạy service

```bash
npm run dev
```

## ✅ Kiểm tra hoạt động

Service sẽ tự động:

- ⏰ Chạy cron job mỗi 5 phút
- 🌐 Crawl từ 6 nguồn: CryptoCompare, CoinDesk, CoinTelegraph, Decrypt, TheBlock, Bitcoin.com
- 🤖 Dùng AI parse HTML lần đầu, sau đó cache patterns
- 💾 Lưu news vào database
- 📊 Trigger sentiment & impact analysis

## 📋 Logs mẫu

```
⏰ Cron Job Started: Syncing News from Multiple Sources...
🚀 Starting crawl from coindesk
📋 Using cached pattern for coindesk.com
✅ Crawled 8/10 articles from coindesk
📊 [coindesk] Result: 5 new saved, 3 duplicates skipped
✅ Cron Job Finished - All Sources Synced.
```

## 💡 Tips

- **Chi phí AI**: ~$1-2/tháng (chỉ dùng khi học pattern mới)
- **Performance**: Pattern cache giúp tăng tốc 50x
- **Thêm nguồn mới**: Chỉ cần 10 dòng code (xem README_AI_CRAWLER.md)

Xem chi tiết: [README_AI_CRAWLER.md](README_AI_CRAWLER.md)
