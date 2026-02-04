-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert price_candles table to hypertable
-- This must be run AFTER the table is created by TypeORM
-- migrate_data => TRUE allows converting non-empty tables
SELECT create_hypertable('price_candles', 'timestamp', 
  chunk_time_interval => INTERVAL '1 day',
  migrate_data => TRUE,
  if_not_exists => TRUE
);

-- Create continuous aggregate for 15m candles
CREATE MATERIALIZED VIEW IF NOT EXISTS price_candles_15m
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('15 minutes', timestamp) AS timestamp,
  symbol,
  FIRST(open, timestamp) AS open,
  MAX(high) AS high,
  MIN(low) AS low,
  LAST(close, timestamp) AS close,
  SUM(volume) AS volume
FROM price_candles
GROUP BY time_bucket('15 minutes', timestamp), symbol
WITH NO DATA;

-- Create continuous aggregate for 1h candles
CREATE MATERIALIZED VIEW IF NOT EXISTS price_candles_1h
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 hour', timestamp) AS timestamp,
  symbol,
  FIRST(open, timestamp) AS open,
  MAX(high) AS high,
  MIN(low) AS low,
  LAST(close, timestamp) AS close,
  SUM(volume) AS volume
FROM price_candles
GROUP BY time_bucket('1 hour', timestamp), symbol
WITH NO DATA;

-- Create continuous aggregate for 1d candles
CREATE MATERIALIZED VIEW IF NOT EXISTS price_candles_1d
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 day', timestamp) AS timestamp,
  symbol,
  FIRST(open, timestamp) AS open,
  MAX(high) AS high,
  MIN(low) AS low,
  LAST(close, timestamp) AS close,
  SUM(volume) AS volume
FROM price_candles
GROUP BY time_bucket('1 day', timestamp), symbol
WITH NO DATA;

-- Add refresh policies to keep aggregates up to date
SELECT add_continuous_aggregate_policy('price_candles_15m',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute',
  if_not_exists => TRUE
);

SELECT add_continuous_aggregate_policy('price_candles_1h',
  start_offset => INTERVAL '12 hours',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '5 minutes',
  if_not_exists => TRUE
);

SELECT add_continuous_aggregate_policy('price_candles_1d',
  start_offset => INTERVAL '7 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Create indexes on continuous aggregates for faster queries
CREATE INDEX IF NOT EXISTS idx_candles_15m_symbol_timestamp 
  ON price_candles_15m (symbol, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_candles_1h_symbol_timestamp 
  ON price_candles_1h (symbol, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_candles_1d_symbol_timestamp 
  ON price_candles_1d (symbol, timestamp DESC);

-- Add data retention policy (optional - keep only last 90 days of raw 1m data)
-- Aggregates will still be available
SELECT add_retention_policy('price_candles', INTERVAL '90 days', if_not_exists => TRUE);
