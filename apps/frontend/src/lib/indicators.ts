/**
 * Technical Indicator Utilities
 * Tính toán các chỉ báo kỹ thuật cơ bản
 */

export interface PriceData {
  time: number;
  close: number;
}

export interface IndicatorValue {
  time: number;
  value: number;
}

/**
 * Tính Simple Moving Average (SMA)
 * @param data - Mảng dữ liệu giá
 * @param period - Chu kỳ MA (ví dụ: 7, 20, 50, 200)
 * @returns Mảng giá trị MA
 */
export function calculateSMA(
  data: PriceData[],
  period: number
): IndicatorValue[] {
  if (data.length < period) return [];

  const result: IndicatorValue[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const avg = sum / period;

    result.push({
      time: data[i].time,
      value: avg,
    });
  }

  return result;
}

/**
 * Tính Exponential Moving Average (EMA)
 * @param data - Mảng dữ liệu giá
 * @param period - Chu kỳ EMA (ví dụ: 12, 26, 50, 200)
 * @returns Mảng giá trị EMA
 */
export function calculateEMA(
  data: PriceData[],
  period: number
): IndicatorValue[] {
  if (data.length < period) return [];

  const result: IndicatorValue[] = [];
  const multiplier = 2 / (period + 1);

  // Bắt đầu với SMA cho giá trị đầu tiên
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;

  result.push({
    time: data[period - 1].time,
    value: ema,
  });

  // Tính EMA cho các giá trị tiếp theo
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({
      time: data[i].time,
      value: ema,
    });
  }

  return result;
}

/**
 * Tính Bollinger Bands
 * @param data - Mảng dữ liệu giá
 * @param period - Chu kỳ (thường là 20)
 * @param stdDev - Số độ lệch chuẩn (thường là 2)
 */
export function calculateBollingerBands(
  data: PriceData[],
  period: number = 20,
  stdDev: number = 2
): {
  upper: IndicatorValue[];
  middle: IndicatorValue[];
  lower: IndicatorValue[];
} {
  if (data.length < period) {
    return { upper: [], middle: [], lower: [] };
  }

  const middle: IndicatorValue[] = [];
  const upper: IndicatorValue[] = [];
  const lower: IndicatorValue[] = [];

  for (let i = period - 1; i < data.length; i++) {
    // Tính SMA
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const sma = sum / period;

    // Tính độ lệch chuẩn
    let variance = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j].close - sma;
      variance += diff * diff;
    }
    const std = Math.sqrt(variance / period);

    const time = data[i].time;
    middle.push({ time, value: sma });
    upper.push({ time, value: sma + stdDev * std });
    lower.push({ time, value: sma - stdDev * std });
  }

  return { upper, middle, lower };
}

/**
 * Tính RSI (Relative Strength Index)
 * @param data - Mảng dữ liệu giá
 * @param period - Chu kỳ (thường là 14)
 */
export function calculateRSI(
  data: PriceData[],
  period: number = 14
): IndicatorValue[] {
  if (data.length < period + 1) return [];

  const result: IndicatorValue[] = [];
  const changes: number[] = [];

  // Tính thay đổi giá
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  // Tính RSI
  for (let i = period - 1; i < changes.length; i++) {
    let gainSum = 0;
    let lossSum = 0;

    for (let j = 0; j < period; j++) {
      const change = changes[i - j];
      if (change > 0) {
        gainSum += change;
      } else {
        lossSum += Math.abs(change);
      }
    }

    const avgGain = gainSum / period;
    const avgLoss = lossSum / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i + 1].time,
      value: rsi,
    });
  }

  return result;
}
