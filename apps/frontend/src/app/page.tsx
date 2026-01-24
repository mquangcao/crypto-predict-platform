"use client";

import { useState } from "react";
import { SymbolSelector } from "../components/market/SymbolSelector";
import { TimeframeSelector } from "../components/market/TimeframeSelector";
import { PriceSummary } from "../components/market/PriceSummary";
import { PriceChart } from "../components/market/PriceChart";
import { NewsList } from "../components/news/NewsList";
import { AiInsightPanel } from "../components/ai/AiInsightPanel";

export type Timeframe = "1m" | "5m" | "1h" | "1d";

export default function HomePage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[2fr_1.2fr] gap-4 p-4 md:p-6">
          {/* Left: market */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <SymbolSelector symbol={symbol} onChangeSymbol={setSymbol} />
                <TimeframeSelector
                  timeframe={timeframe}
                  onChangeTimeframe={setTimeframe}
                />
              </div>
              <PriceSummary symbol={symbol} timeframe={timeframe} />
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 md:p-4 h-[360px]">
              <PriceChart symbol={symbol} timeframe={timeframe} />
            </div>
          </section>

          {/* Right: news + AI */}
          <section className="space-y-4">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 md:p-4 max-h-[260px] flex flex-col">
              <h2 className="text-sm font-semibold mb-2 flex items-center justify-between text-slate-800">
                <span>Tin tức mới nhất</span>
                <span className="text-xs text-slate-500">Mock data</span>
              </h2>
              <div className="flex-1 overflow-y-auto pr-1">
                <NewsList />
              </div>
            </div>

            <AiInsightPanel />
          </section>
        </div>
      </main>
    </div>
  );
}
