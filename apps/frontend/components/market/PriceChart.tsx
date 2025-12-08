"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  AreaSeries,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";
import type { Timeframe } from "../../app/page";

type Props = {
  symbol: string;
  timeframe: Timeframe;
};

type Candle = {
  time: number; // unix seconds
  close: number;
};

export function PriceChart({ symbol, timeframe }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // init chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#020617" },
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

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#4f46e5",
      topColor: "rgba(79,70,229,0.4)",
      bottomColor: "rgba(15,23,42,0.1)",
    }) as ISeriesApi<"Area">;

    chartRef.current = chart;
    seriesRef.current = areaSeries;

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
      seriesRef.current = null;
    };
  }, []);

  // fetch data khi symbol / timeframe đổi
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
        const candles: Candle[] = json.candles || [];

        const lineData: LineData[] = candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.close,
        }));

        if (seriesRef.current) {
          seriesRef.current.setData(lineData);
        }
      } catch (err: any) {
        console.error(err);
        setError("Không lấy được dữ liệu từ market-service");
      } finally {
        setLoading(false);
      }
    }

    fetchCandles();
  }, [symbol, timeframe]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>
          Biểu đồ giá {symbol} ({timeframe})
        </span>
      </div>
      <div
        ref={containerRef}
        className="flex-1 rounded-lg bg-slate-950 overflow-hidden relative"
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
