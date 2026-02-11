"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type CandlestickData,
  type ISeriesApi,
  type IChartApi,
  type UTCTimestamp,
  type LineData,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import type { Timeframe } from "../../app/page";
import { usePriceStream } from "./usePriceStream";
import { calculateSMA, calculateEMA } from "../../lib/indicators";
import { useNewsEvents, type NewsEvent } from "../../hooks/useNewsEvents";
import type { Indicator } from "./IndicatorControls";

type Props = {
  symbol: string;
  timeframe: Timeframe;
  indicators?: Indicator[];
  showNewsMarkers?: boolean;
};

type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// Map timeframe to seconds per candle
const timeframeToSeconds: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 5 * 60,
  "1h": 60 * 60,
  "1d": 24 * 60 * 60,
};

export function PriceChart({
  symbol,
  timeframe,
  indicators = [],
  showNewsMarkers = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());

  // Helper function to ensure data is sorted before setting
  const setSortedCandleData = (data: CandlestickData[]) => {
    if (!candleSeriesRef.current) return;

    // Ensure data is sorted
    const sorted = [...data].sort((a, b) => Number(a.time) - Number(b.time));

    // Validate
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].time < sorted[i - 1].time) {
        console.error(
          "[PriceChart] setSortedCandleData: Invalid sort at index",
          i,
          sorted[i].time,
          "<",
          sorted[i - 1].time,
        );
        throw new Error(`Data not sorted at index ${i}`);
      }
    }

    candleSeriesRef.current.setData(sorted);
    console.log(
      "[PriceChart] setSortedCandleData: Set",
      sorted.length,
      "sorted items successfully",
    );
  };

  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime price from WebSocket (Binance → market-service → WS)
  const realtimePrice = usePriceStream(symbol);

  // Fetch news events for markers
  const { events: newsEvents } = useNewsEvents({
    symbol,
    limit: 100,
  });

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

    // API: addCandlestickSeries() in v4
    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: "#22c55e", // green for up
      downColor: "#ef4444", // red for down
      borderVisible: true,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
    });

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
      // Clean up indicator series
      indicatorSeriesRef.current.forEach((series) => {
        if (chartRef.current) {
          chartRef.current.removeSeries(series);
        }
      });
      indicatorSeriesRef.current.clear();
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

        // CRITICAL: Sort by time in ascending order (lightweight-charts requirement)
        console.log(
          "[PriceChart] Original data (first 3 candles):",
          fetched.slice(0, 3).map((c) => ({ time: c.time, close: c.close })),
        );

        const sorted = [...fetched].sort((a, b) => a.time - b.time);

        console.log(
          "[PriceChart] Sorted data (first 3 candles):",
          sorted.slice(0, 3).map((c) => ({ time: c.time, close: c.close })),
        );
        console.log("[PriceChart] Fetched", fetched.length, "candles");
        console.log(
          "[PriceChart] First candle time:",
          sorted[0]?.time,
          "Last candle time:",
          sorted[sorted.length - 1]?.time,
        );

        // Validate sort order
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i].time < sorted[i - 1].time) {
            console.error(
              "[PriceChart] ERROR: Data not sorted at index",
              i,
              sorted[i].time,
              "<",
              sorted[i - 1].time,
            );
            throw new Error("Data sorting failed - not in ascending order");
          }
        }

        setCandles(sorted);

        const candleData: CandlestickData[] = sorted.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        // Final validation - verify candleData is sorted
        for (let i = 1; i < candleData.length; i++) {
          if (candleData[i].time < candleData[i - 1].time) {
            console.error(
              "[PriceChart] ERROR: candleData not sorted at index",
              i,
              candleData[i].time,
              "<",
              candleData[i - 1].time,
            );
            throw new Error("CandleData mapping broke sort order");
          }
        }

        console.log(
          "[PriceChart] Final candleData (first 3):",
          candleData.slice(0, 3),
        );
        console.log(
          "[PriceChart] Setting candlestick data with",
          candleData.length,
          "sorted items",
        );

        // Use helper to ensure sorted
        setSortedCandleData(candleData);
      } catch (err: any) {
        console.error(err);
        setError("Could not fetch data from market-service");
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

  // ===== 2.5. Update indicators when candles or indicators change =====
  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;

    // Remove old indicator series
    indicatorSeriesRef.current.forEach((series, id) => {
      if (!indicators.find((ind) => ind.id === id)) {
        chartRef.current!.removeSeries(series);
        indicatorSeriesRef.current.delete(id);
      }
    });

    // Add/update indicator series
    indicators.forEach((indicator) => {
      if (!indicator.visible) {
        // Hide indicator if exists
        const series = indicatorSeriesRef.current.get(indicator.id);
        if (series && chartRef.current) {
          chartRef.current.removeSeries(series);
          indicatorSeriesRef.current.delete(indicator.id);
        }
        return;
      }

      // Calculate indicator data
      const priceData = candles.map((c) => ({
        time: c.time,
        close: c.close,
      }));

      let lineData: LineData[] = [];

      if (indicator.type === "SMA") {
        const smaValues = calculateSMA(priceData, indicator.period);
        lineData = smaValues.map((v) => ({
          time: v.time as Time,
          value: v.value,
        }));
      } else if (indicator.type === "EMA") {
        const emaValues = calculateEMA(priceData, indicator.period);
        lineData = emaValues.map((v) => ({
          time: v.time as Time,
          value: v.value,
        }));
      }

      if (lineData.length === 0) return;

      // Create or update series
      let series = indicatorSeriesRef.current.get(indicator.id);
      if (!series) {
        series = (chartRef.current as any)!.addLineSeries({
          color: indicator.color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        });
        indicatorSeriesRef.current.set(indicator.id, series as any);
      }

      if (series) {
        series.setData(lineData);
      }
    });
  }, [candles, indicators]);

  // ===== 2.6. Add news markers when news events are available =====
  useEffect(() => {
    if (!candleSeriesRef.current) {
      console.log("[PriceChart] No candle series ref");
      return;
    }

    // Clear markers if disabled
    if (!showNewsMarkers) {
      console.log("[PriceChart] News markers disabled, clearing...");
      (candleSeriesRef.current as any).setMarkers([]);
      return;
    }

    if (newsEvents.length === 0) {
      console.log("[PriceChart] No news events available");
      return;
    }

    if (candles.length === 0) {
      console.log("[PriceChart] No candles available yet");
      return;
    }

    const firstTime = candles[0].time;
    const lastTime = candles[candles.length - 1].time;
    console.log("[PriceChart] Candle time range:", { firstTime, lastTime });
    console.log("[PriceChart] Processing", newsEvents.length, "news events");

    // Convert news events to markers
    const markers: SeriesMarker<Time>[] = newsEvents
      .filter((event) => {
        // Filter events that are within the candle time range
        const inRange =
          event.timestamp >= firstTime && event.timestamp <= lastTime;
        if (!inRange) {
          console.log(
            "[PriceChart] Event outside range:",
            event.title,
            event.timestamp,
          );
        }
        return inRange;
      })
      .map((event) => {
        const sentiment = event.sentiment || "neutral";
        let color = "#64748b"; // neutral color
        let shape: SeriesMarker<Time>["shape"] = "circle";

        if (sentiment === "bullish") {
          color = "#10b981"; // green
          shape = "arrowUp";
        } else if (sentiment === "bearish") {
          color = "#ef4444"; // red
          shape = "arrowDown";
        }

        return {
          time: event.timestamp as Time,
          position: (sentiment === "bullish" ? "belowBar" : "aboveBar") as
            | "belowBar"
            | "aboveBar",
          color,
          shape,
          text: event.source.substring(0, 10),
          size: 1,
        } as SeriesMarker<Time>;
      })
      // CRITICAL: Sort markers by time in ascending order (lightweight-charts requirement)
      .sort((a, b) => Number(a.time) - Number(b.time));

    console.log(
      "[PriceChart] Created",
      markers.length,
      "markers (sorted):",
      markers,
    );

    // Apply markers to candlestick series (v4 API)
    (candleSeriesRef.current as any).setMarkers(markers);
    console.log("[PriceChart] Markers applied to chart successfully");
  }, [candles, newsEvents, showNewsMarkers]);

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
        // Still in current candle
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

      // New candle started
      const newCandle: Candle = {
        time: last.time + step,
        open: realtimePrice,
        high: realtimePrice,
        low: realtimePrice,
        close: realtimePrice,
        volume: last.volume, // Reusing previous volume, todo: stream volume separately
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
            Source: Binance · Candlestick
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
            Loading data from Binance...
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
