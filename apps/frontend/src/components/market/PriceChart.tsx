"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  createChart,
  type CandlestickData,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Timeframe } from "../../app/page";
import { usePriceStream } from "./usePriceStream";

type Props = {
  symbol: string;
  timeframe: Timeframe;
};

type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// map timeframe -> số giây cho 1 nến
const timeframeToSeconds: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 5 * 60,
  "1h": 60 * 60,
  "1d": 24 * 60 * 60,
};

export function PriceChart({ symbol, timeframe }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // realtime price từ WS (Binance → market-service → WS)
  const realtimePrice = usePriceStream(symbol);

  // ===== 1. Init chart (1 lần) =====
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#ffffff" },
        textColor: "#334155",
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
        secondsVisible: false,
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      crosshair: {
        mode: 1,
      },
    });

    // 👉 API mới: addSeries(CandlestickSeries, options)
    const candleSeries: ISeriesApi<"Candlestick"> = chart.addSeries(
      CandlestickSeries,
      {
        upColor: "#22c55e", // xanh lên
        downColor: "#ef4444", // đỏ xuống
        borderVisible: true,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
      },
    );

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      chartRef.current.resize(clientWidth, clientHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  // ===== 2. Load history từ market-service khi symbol/timeframe đổi =====
  useEffect(() => {
    async function fetchCandles() {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/market/candles?symbol=${symbol}&tf=${timeframe}&limit=200`;
        console.log("[PriceChart] Fetch:", url);
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          console.error("[PriceChart] HTTP error", res.status, text);
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const fetched: Candle[] = json.data?.candles || [];

        setCandles(fetched);

        const candleData: CandlestickData[] = fetched.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        if (candleSeriesRef.current) {
          candleSeriesRef.current.setData(candleData);
        }
      } catch (err: any) {
        console.error(err);
        setError("Không lấy được dữ liệu từ market-service");
        setCandles([]);
        if (candleSeriesRef.current) {
          candleSeriesRef.current.setData([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCandles();
  }, [symbol, timeframe]);

  // ===== 3. Realtime update nến cuối cùng bằng WS =====
  useEffect(() => {
    if (realtimePrice == null) return;
    if (!candleSeriesRef.current) return;
    if (candles.length === 0) return;

    const step = timeframeToSeconds[timeframe];
    const nowSec = Math.floor(Date.now() / 1000);

    setCandles((prev) => {
      if (prev.length === 0) return prev;

      const last = prev[prev.length - 1];
      let updatedCandles = [...prev];

      if (nowSec < last.time + step) {
        // vẫn trong nến hiện tại
        const updatedLast: Candle = {
          ...last,
          close: realtimePrice,
          high: Math.max(last.high, realtimePrice),
          low: Math.min(last.low, realtimePrice),
        };
        updatedCandles[updatedCandles.length - 1] = updatedLast;

        candleSeriesRef.current!.update({
          time: updatedLast.time as UTCTimestamp,
          open: updatedLast.open,
          high: updatedLast.high,
          low: updatedLast.low,
          close: updatedLast.close,
        });

        return updatedCandles;
      }

      // sang nến mới
      const newCandle: Candle = {
        time: last.time + step,
        open: realtimePrice,
        high: realtimePrice,
        low: realtimePrice,
        close: realtimePrice,
        volume: last.volume, // tạm reuse volume, sau thêm stream volume riêng
      };

      updatedCandles = [...prev, newCandle];

      candleSeriesRef.current!.update({
        time: newCandle.time as UTCTimestamp,
        open: newCandle.open,
        high: newCandle.high,
        low: newCandle.low,
        close: newCandle.close,
      });

      return updatedCandles;
    });
  }, [realtimePrice, timeframe]);

  const last = candles.length ? candles[candles.length - 1] : null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top bar kiểu TradingView: symbol, timeframe, OHLC, Live */}
      <div className="flex justify-between items-center mb-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-bold text-slate-900 uppercase tracking-wide">
            {symbol}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">
            {timeframe}
          </span>

          {last && (
            <>
              <span className="text-slate-500 font-medium">
                O{" "}
                <span className="text-slate-900 font-bold">
                  {last.open.toLocaleString("en-US")}
                </span>
              </span>
              <span className="text-slate-500 font-medium">
                H{" "}
                <span className="text-slate-900 font-bold">
                  {last.high.toLocaleString("en-US")}
                </span>
              </span>
              <span className="text-slate-500 font-medium">
                L{" "}
                <span className="text-slate-900 font-bold">
                  {last.low.toLocaleString("en-US")}
                </span>
              </span>
              <span className="text-slate-500 font-medium">
                C{" "}
                <span className="text-slate-900 font-bold">
                  {last.close.toLocaleString("en-US")}
                </span>
              </span>
            </>
          )}

          <span className="text-[11px] text-slate-400 hidden sm:inline italic">
            Nguồn: Binance · Candlestick
          </span>
        </div>

        <div className="flex items-center gap-2">
          {realtimePrice != null && (
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 rounded-xl bg-white overflow-hidden relative border border-slate-100"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 bg-white/60 backdrop-blur-[2px] z-10 font-medium">
            Đang tải dữ liệu từ Binance...
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-rose-600 bg-white/60 backdrop-blur-[2px] z-10 font-bold uppercase tracking-wider">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
