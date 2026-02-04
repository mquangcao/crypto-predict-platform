# Market Service - TimescaleDB Setup

## Setup Instructions

### 1. Start TimescaleDB Container

```bash
docker-compose up -d market-db
```

### 2. Wait for Database to be Ready

```bash
docker-compose logs -f market-db
# Wait for "database system is ready to accept connections"
```

### 3. Start Market Service (IMPORTANT: Do this BEFORE running migration)

Start the service first to let TypeORM create the `price_candles` table:

```bash
cd apps/market-service
npm run dev
```

Wait for the service to fully start and see "Database connection established" in the logs.
Then stop the service (Ctrl+C).

### 4. Run Migration to Setup Hypertable

Now that the table exists, convert it to TimescaleDB hypertable:

```bash
# From project root
docker exec -i crypto-platform-market-db-1 psql -U postgres -d market_db < apps/market-service/migrations/001_setup_timescaledb.sql
```

**Note:** The migration will automatically migrate any existing data to the hypertable format.

Or manually:

```bash
# Connect to database
docker exec -it crypto-platform-market-db-1 psql -U postgres -d market_db

# Then paste the contents of migrations/001_setup_timescaledb.sql
```

### 5. Restart Market Service

Now restart the service. It will automatically:

- Fetch last 1000 1m candles for each symbol on startup
- Start a cron job to fetch latest candle every minute
- Store all data in TimescaleDB hypertable with continuous aggregates

```bash
cd apps/market-service
npm run dev
```

**Note:** The order is critical:

1. Start service → TypeORM creates table
2. Stop service → Run migration → Convert to hypertable
3. Restart service → Service works with hypertable + continuous aggregates

## How It Works

### Data Storage

- **Raw 1m candles** → `price_candles` table (hypertable)
- **15m candles** → `price_candles_15m` (continuous aggregate, auto-refreshed)
- **1h candles** → `price_candles_1h` (continuous aggregate, auto-refreshed)
- **1d candles** → `price_candles_1d` (continuous aggregate, auto-refreshed)

### Automatic Updates

1. **OnModuleInit**: Fetches last 1000 1m candles for each symbol
2. **Cron (every minute)**: Fetches latest 2 candles to keep data fresh
3. **TimescaleDB**: Auto-refreshes continuous aggregates in background

### Data Retention

- Raw 1m data: 90 days (configurable in migration)
- Aggregated data (15m, 1h, 1d): Retained indefinitely

### Querying Candles

```typescript
// Get candles for impact analysis
const candles = await candleStorageService.getCandles(
  'BTCUSDT',
  '15m',
  new Date('2026-01-13T10:00:00Z'),
  new Date('2026-01-13T10:15:00Z'),
);

// Get latest candle
const latest = await candleStorageService.getLatestCandle('BTCUSDT', '1h');
```

## Verification

Check if hypertable is created:

```sql
SELECT * FROM timescaledb_information.hypertables
WHERE hypertable_name = 'price_candles';

-- Check continuous aggregates
SELECT * FROM timescaledb_information.continuous_aggregates;

-- Query data
SELECT * FROM price_candles ORDER BY timestamp DESC LIMIT 10;
SELECT * FROM price_candles_15m ORDER BY timestamp DESC LIMIT 10;
```

## For News-AI-Service

The news-ai-service can now query historical candles to calculate impact:

```typescript
// Example: Calculate 15m impact after news published
const newsTime = new Date('2026-01-13T10:00:00Z');
const before = await candleStorageService.getLatestCandle('BTCUSDT', '15m');
const after = await candleStorageService.getCandles(
  'BTCUSDT',
  '15m',
  newsTime,
  new Date(newsTime.getTime() + 15 * 60 * 1000),
);
```
