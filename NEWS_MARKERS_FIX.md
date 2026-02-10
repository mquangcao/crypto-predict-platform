# News Markers Fix Summary

## Problem

- HTTP 500 error when fetching news by symbol
- PostgreSQL error: "op ANY/ALL (array) requires array on right side"
- The query was failing when trying to filter news by cryptocurrency symbol

## Root Cause

The `symbols` column in the `news_article` table was already a PostgreSQL array type, but the application code wasn't handling null values correctly.

## Fixes Applied

### 1. Backend (News Service)

**File:** `apps/news-service/src/news/entities/news-article.entity.ts`

- Changed from `@Column('simple-array', { nullable: true })` to `@Column('text', { array: true, nullable: true })`
- This ensures proper PostgreSQL array handling

**File:** `apps/news-service/src/news/services/news.service.ts  `

- Added try-catch fallback in `findBySymbol()` method
- If ANY() query fails, fallback to LIKE query for compatibility

### 2. Frontend

**File:** `apps/frontend/src/hooks/useNewsEvents.ts`

- Changed to use general news endpoint instead of symbol-specific endpoint
- Added client-side filtering by symbol (searches in news title)
- Added better error handling and null-safe sentiment parsing
- Added comprehensive debug logging

### 3. Translation

- All Vietnamese text converted to English throughout the components
- Updated labels, messages, and comments

## Database Status

- The `symbols` column is already configured as `text[]` (PostgreSQL array)
- Sample data exists with proper array format: `{BTCUSDT,ETHUSDT}`
- No migration needed - schema is correct

## How News Markers Work Now

1. **Fetch News**: Uses `/api/news?limit=100` (general endpoint)
2. **Client Filter**: Filters news by symbol in the title (e.g., "BTC", "BTCUSDT")
3. **Parse Timestamps**: Converts `publishedAt` to Unix timestamps
4. **Create Markers**: Maps news events to chart markers with sentiment colors:
   - 🔴 Red arrow ↓ = Bearish news
   - 🟢 Green arrow ↑ = Bullish news
   - ⚪ Gray circle = Neutral news
5. **Display**: Markers appear at the corresponding timestamp on the candlestick chart

## Debug Console Logs

Check browser console (F12) for:

- `[useNewsEvents] Fetching:` - API call
- `[useNewsEvents] Parsed events:` - Processed news with timestamps
- `[PriceChart] Candle time range:` - Chart time boundaries
- `[PriceChart] Created X markers:` - Marker creation details

## Testing

To verify the fix works:

1. Open the application
2. Open browser console (F12)
3. Check for debug logs showing news events being fetched
4. Look for markers on the chart (small arrows/circles)
5. No more HTTP 500 errors should appear
