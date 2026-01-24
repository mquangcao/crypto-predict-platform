"use client";

import { useEffect, useState } from "react";
import type { Timeframe } from "../../app/page";
import { usePriceStream } from "./usePriceStream";

type Props = {
  symbol: string;
  timeframe: Timeframe;
};

type Candle = {
  time: number;
  close: number;
};

export function PriceSummary({ symbol, timeframe }: Props) {
  const [price, setPrice] = useState<number | null>(null);
  const [changePct, setChangePct] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ realtime price từ WS
  const realtimePrice = usePriceStream(symbol);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      try {
        const url = `http://localhost:4002/market/candles?symbol=${symbol}&tf=${timeframe}&limit=200`;
        console.log("[PriceSummary] Fetch:", url);

        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          console.error("[PriceSummary] HTTP error", res.status, text);
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        const candles: Candle[] = json.candles || [];

        if (!candles.length) {
          setPrice(null);
          setChangePct(null);
          return;
        }

        const first = candles[0];
        const last = candles[candles.length - 1];

        setPrice(last.close);

        if (first.close > 0) {
          const diff = last.close - first.close;
          const pct = (diff / first.close) * 100;
          setChangePct(pct);
        } else {
          setChangePct(null);
        }
      } catch (err) {
        console.error(err);
        setPrice(null);
        setChangePct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [symbol, timeframe]);

  // Nếu có realtime price → ưu tiên hiển thị realtime
  const effectivePrice = realtimePrice ?? price;
  const displayPrice =
    effectivePrice !== null ? effectivePrice.toLocaleString("en-US") : "--";

  let changeLabel = "--";
  let changeClass =
    "text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium";

  if (changePct !== null) {
    const rounded = Number(changePct.toFixed(2));
    const sign = rounded > 0 ? "+" : "";
    changeLabel = `${sign}${rounded}%`;

    if (rounded > 0) {
      changeClass =
        "text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold shadow-sm";
    } else if (rounded < 0) {
      changeClass =
        "text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 font-bold shadow-sm";
    }
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div>
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 uppercase tracking-wider">
          <span>
            {symbol} · {timeframe}
          </span>
          {realtimePrice !== null && (
            <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <div className="text-lg font-bold text-slate-900">
          {loading && effectivePrice === null
            ? "Đang tải..."
            : `${displayPrice} USDT`}
        </div>
      </div>
      <div className={changeClass}>{changeLabel}</div>
    </div>
  );
}
