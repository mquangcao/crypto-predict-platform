"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type CandlestickData,
  type ISeriesApi,
  type UTCTimestamp,
  // @ts-ignore – CandlestickSeries là value trong runtime của version mới
  CandlestickSeries,
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
        background: { color: "#020617" }, // slate-950
        textColor: "#e5e7eb",
      },
      rightPriceScale: {
        borderColor: "#1f2937",
      },
      timeScale: {
        borderColor: "#1f2937",
        timeVisible: true,
        secondsVisible: false,
      },
      grid: {
        vertLines: { color: "#020617" },
        horzLines: { color: "#020617" },
      },
      crosshair: {
        mode: 1,
      },
    });

    // 👉 API mới: addSeries(CandlestickSeries, options)
    // @ts-ignore – bỏ qua TS, runtime sẽ dùng value CandlestickSeries của lib
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
      }
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
        const url = `http://localhost:4002/market/candles?symbol=${symbol}&tf=${timeframe}&limit=200`;
        console.log("[PriceChart] Fetch:", url);
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          console.error("[PriceChart] HTTP error", res.status, text);
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const fetched: Candle[] = json.candles || [];

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
  }, [realtimePrice, timeframe, candles.length]);

  const last = candles.length ? candles[candles.length - 1] : null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top bar kiểu TradingView: symbol, timeframe, OHLC, Live */}
      <div className="flex justify-between items-center mb-2 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-slate-100">{symbol}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700">
            {timeframe}
          </span>

          {last && (
            <>
              <span className="text-slate-400">
                O{" "}
                <span className="text-slate-100">
                  {last.open.toLocaleString("en-US")}
                </span>
              </span>
              <span className="text-slate-400">
                H{" "}
                <span className="text-slate-100">
                  {last.high.toLocaleString("en-US")}
                </span>
              </span>
              <span className="text-slate-400">
                L{" "}
                <span className="text-slate-100">
                  {last.low.toLocaleString("en-US")}
                </span>
              </span>
              <span className="text-slate-400">
                C{" "}
                <span className="text-slate-100">
                  {last.close.toLocaleString("en-US")}
                </span>
              </span>
            </>
          )}

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Nguồn: Binance · Candlestick
          </span>
        </div>

        <div className="flex items-center gap-2">
          {realtimePrice != null && (
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 rounded-xl bg-slate-950 overflow-hidden relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 bg-slate-950/40">
            Đang tải dữ liệu từ Binance...
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-rose-400 bg-slate-950/40">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
