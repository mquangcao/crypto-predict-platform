# News Price Impact - Technical Indicators Documentation

## Tổng quan

Entity `NewsPriceImpact` đã được mở rộng để bao gồm **18 technical indicators** nhằm hỗ trợ việc train model AI/ML dự đoán tác động của tin tức lên giá crypto.

## Cấu trúc dữ liệu

### GROUP 1: TARGET (Label - Giá trị cần dự đoán)

| Field            | Type  | Mô tả                                                            |
| ---------------- | ----- | ---------------------------------------------------------------- |
| `priceBefore`    | float | Giá Open của nến tại thời điểm tin ra                            |
| `priceAfter`     | float | Giá Close sau khi hết timeframe                                  |
| `returnPct`      | float | % thay đổi giá = (priceAfter - priceBefore) / priceBefore \* 100 |
| `maxDrawdownPct` | float | % sụt giảm tối đa trong khung giờ (đo rủi ro)                    |
| `maxRunupPct`    | float | % tăng tối đa trong khung giờ (đo tiềm năng)                     |

**Ý nghĩa cho AI:**

- `returnPct`: Label chính cho regression model
- `maxDrawdownPct`: Giúp model học về rủi ro downside
- `maxRunupPct`: Giúp model học về tiềm năng upside

### GROUP 2: MOMENTUM CONTEXT (Đà giá)

| Field           | Type  | Mô tả                                              |
| --------------- | ----- | -------------------------------------------------- |
| `rsi14`         | float | Relative Strength Index (14 periods), Range: 0-100 |
| `macdHistogram` | float | MACD Histogram (đo sức mạnh momentum)              |

**Ý nghĩa cho AI:**

- **RSI > 70**: Thị trường quá mua → Tin tốt khó đẩy giá lên thêm
- **RSI < 30**: Thị trường quá bán → Tin xấu có thể không còn tác động mạnh
- **MACD Histogram dương và tăng**: Momentum mạnh → Tin tốt có thể khuếch đại
- **MACD Histogram âm và giảm**: Momentum yếu → Tin xấu có thể khuếch đại

### GROUP 3: TREND CONTEXT (Xu hướng)

| Field                | Type  | Mô tả                |
| -------------------- | ----- | -------------------- |
| `priceToSma200Ratio` | float | priceBefore / SMA200 |
| `priceToEma50Ratio`  | float | priceBefore / EMA50  |

**Ý nghĩa cho AI:**

- **Ratio > 1**: Uptrend (giá trên MA)
- **Ratio < 1**: Downtrend (giá dưới MA)
- **Ví dụ thực tế**:
  - Tin xấu trong uptrend (ratio > 1.1): Có thể là buying opportunity
  - Tin xấu trong downtrend (ratio < 0.9): Có thể làm sập thêm

### GROUP 4: VOLATILITY CONTEXT (Biến động)

| Field             | Type  | Mô tả                               |
| ----------------- | ----- | ----------------------------------- |
| `volatilityAtr14` | float | Average True Range chuẩn hóa theo % |
| `bbWidth`         | float | Bollinger Bands Width (%)           |

**Ý nghĩa cho AI:**

- **ATR cao**: Thị trường biến động mạnh → Tin tức impact lớn hơn
- **ATR thấp**: Thị trường ổn định → Tin tức impact nhỏ hơn
- **BB Width thấp (< 2%)**: "Nút cổ chai" → Sắp có breakout lớn
- **BB Width cao (> 5%)**: Thị trường đang loạn → Tin tức có thể bị "nhiễu"

### GROUP 5: LIQUIDITY CONTEXT (Thanh khoản)

| Field            | Type  | Mô tả                            |
| ---------------- | ----- | -------------------------------- |
| `volumeRatio24h` | float | Volume hiện tại / Avg Volume 24h |

**Ý nghĩa cho AI:**

- **Ratio > 2**: Đột biến volume → Tin tức rất quan trọng
- **Ratio < 0.5**: Volume thấp → Tin tức có thể không đáng tin
- **Ví dụ**: Tin tốt + Volume cao → Tín hiệu mạnh để giá tăng

### GROUP 6: MARKET CORRELATION (Tương quan thị trường)

| Field               | Type  | Mô tả                            |
| ------------------- | ----- | -------------------------------- |
| `btcPriceChange24h` | float | % thay đổi giá BTC trong 24h qua |
| `btcDominance`      | float | Chỉ số BTC Dominance (%)         |

**Ý nghĩa cho AI:**

- **BTC tăng mạnh + Tin tốt về Altcoin**: Impact có thể bị giảm (vì dòng tiền vào BTC)
- **BTC giảm mạnh + Tin tốt về Altcoin**: Impact khó xảy ra (vì BTC kéo cả thị trường)
- **BTC Dominance > 60%**: Altcoin khó pump (dù có tin tốt)

## Cách tính toán

### 1. Historical Data Requirements

```typescript
// Để tính SMA200, cần ít nhất 200 candles trước thời điểm tin ra
const historicalStartTime = beforeTime - 200 * timeframeMs;
const historicalCandles = await getCandlesInRange(
  symbol,
  timeframe,
  historicalStartTime,
  beforeTime,
);
```

### 2. Impact Window Data

```typescript
// Candles trong khoảng thời gian impact để tính maxDrawdown, maxRunup
const impactCandles = await getCandlesInRange(
  symbol,
  timeframe,
  beforeTime,
  afterTime,
);
```

### 3. Technical Indicator Calculation

Service `TechnicalIndicatorService` cung cấp các methods:

- `calculateRSI(candles, period)`: RSI 14 periods
- `calculateMACDHistogram(candles)`: MACD Histogram
- `calculateSMA(values, period)`: Simple Moving Average
- `calculateEMA(values, period)`: Exponential Moving Average
- `calculateATR(candles, period)`: Average True Range
- `calculateBBWidth(candles, period, stdDev)`: Bollinger Bands Width
- `calculateVolumeRatio(candles, periods)`: Volume Ratio
- `calculateMaxDrawdown(candles, startPrice)`: Max sụt giảm
- `calculateMaxRunup(candles, startPrice)`: Max tăng giá

## Ví dụ sử dụng cho ML

### Feature Engineering

```python
# Features (X)
features = [
    'rsi14',
    'macdHistogram',
    'priceToSma200Ratio',
    'priceToEma50Ratio',
    'volatilityAtr14',
    'bbWidth',
    'volumeRatio24h',
    'btcPriceChange24h',
]

# Target (y)
target = 'returnPct'  # hoặc 'maxDrawdownPct' / 'maxRunupPct'
```

### Model Training Pattern

```python
from sklearn.ensemble import RandomForestRegressor

# Load data
df = load_news_price_impact()

# Feature selection
X = df[features]
y = df['returnPct']

# Train model
model = RandomForestRegressor()
model.fit(X, y)

# Insights: Feature importance
print(model.feature_importances_)
# Ví dụ output: [0.15, 0.12, 0.22, 0.18, 0.08, 0.05, 0.10, 0.10]
# => priceToSma200Ratio quan trọng nhất (0.22)
```

### Conditional Rules AI có thể học

**Rule 1: Overbought + Good News**

```python
if rsi14 > 70 and sentiment == 'positive':
    expected_return = LOW  # Vì đã quá mua
```

**Rule 2: Downtrend + Bad News**

```python
if priceToSma200Ratio < 0.9 and sentiment == 'negative':
    expected_return = VERY_NEGATIVE  # Vì đang downtrend
```

**Rule 3: Low Volatility + Big News**

```python
if bbWidth < 0.02 and volumeRatio24h > 2:
    expected_return = HIGH_VOLATILITY  # Breakout sắp xảy ra
```

**Rule 4: BTC Correlation**

```python
if btcPriceChange24h < -5 and symbol != 'BTCUSDT':
    expected_return = NEGATIVE  # Altcoin khó tăng khi BTC giảm
```

## Database Schema

```sql
CREATE TABLE news_price_impact (
  id UUID PRIMARY KEY,
  news_id VARCHAR,
  symbol VARCHAR,
  timeframe VARCHAR,

  -- GROUP 1: Target
  price_before FLOAT,
  price_after FLOAT,
  return_pct FLOAT,
  max_drawdown_pct FLOAT,
  max_runup_pct FLOAT,

  -- GROUP 2: Momentum
  rsi14 FLOAT,
  macd_histogram FLOAT,

  -- GROUP 3: Trend
  price_to_sma200_ratio FLOAT,
  price_to_ema50_ratio FLOAT,

  -- GROUP 4: Volatility
  volatility_atr14 FLOAT,
  bb_width FLOAT,

  -- GROUP 5: Liquidity
  volume_ratio_24h FLOAT,

  -- GROUP 6: Market Correlation
  btc_price_change_24h FLOAT,
  btc_dominance FLOAT,

  created_at TIMESTAMP
);

-- Index để query nhanh
CREATE INDEX idx_symbol_timeframe_created
ON news_price_impact(symbol, timeframe, created_at);
```

## Performance Considerations

### 1. Data Requirements

- **Minimum candles**: 200+ historical candles cho SMA200
- **Timeframe**: 15m, 1h, 1d
- **Symbols**: BTCUSDT (bắt buộc) + các altcoins

### 2. API Calls

Mỗi lần phân tích 1 news cần:

- 2 calls để lấy `candleBefore` và `candleAfter`
- 1 call để lấy `impactCandles`
- 1 call để lấy `historicalCandles` (200+ candles)
- 1 call để lấy `btcPriceChange24h` (nếu không phải BTCUSDT)

**Total: 4-5 RPC calls** đến market-service

### 3. Optimization Tips

```typescript
// Cache BTC price change cho tất cả altcoins cùng thời điểm
const btcCache = new Map<string, number>();

async getBtcPriceChange24h(targetTime: Date): Promise<number | null> {
  const cacheKey = targetTime.toISOString().split('T')[0]; // Cache theo ngày
  if (btcCache.has(cacheKey)) {
    return btcCache.get(cacheKey);
  }

  const value = await this.fetchBtcPriceChange(targetTime);
  btcCache.set(cacheKey, value);
  return value;
}
```

## Troubleshooting

### Issue 1: Insufficient Historical Data

```
⚠️ Cannot calculate SMA200: only 150 candles available
```

**Solution**: Tăng `historicalStartTime` hoặc skip indicator này

```typescript
const sma200 = ti.calculateSMA(closes, 200);
impact.priceToSma200Ratio = sma200 ? currentPrice / sma200 : undefined;
```

### Issue 2: Missing BTC Data

```
❌ Error getting BTC price change: timeout
```

**Solution**: Set default value hoặc retry

```typescript
try {
  btcPriceChange24h = await this.getBtcPriceChange24h(publishedAt);
} catch (error) {
  this.logger.warn('Using default BTC price change: 0');
  btcPriceChange24h = 0; // Neutral value
}
```

## Next Steps

1. **Start market-service** để bắt đầu lưu candles vào TimescaleDB
2. **Configure SQS queue** để news-ai-service nhận impact messages
3. **Collect data** trong vài tuần/tháng
4. **Export to CSV** để train model

```typescript
// Export command
async exportToCSV() {
  const impacts = await impactRepository.find({
    order: { createdAt: 'ASC' }
  });

  const csv = impacts.map(i => ({
    ...i,
    // Có thể thêm derived features
    is_overbought: i.rsi14 > 70,
    is_oversold: i.rsi14 < 30,
    in_uptrend: i.priceToSma200Ratio > 1,
  }));

  writeCSV('impact_training_data.csv', csv);
}
```

## References

- RSI: https://www.investopedia.com/terms/r/rsi.asp
- MACD: https://www.investopedia.com/terms/m/macd.asp
- Bollinger Bands: https://www.investopedia.com/terms/b/bollingerbands.asp
- ATR: https://www.investopedia.com/terms/a/atr.asp
