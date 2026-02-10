"use client";

import { useState } from "react";
import { SymbolSelector } from "../components/market/SymbolSelector";
import { TimeframeSelector } from "../components/market/TimeframeSelector";
import { PriceSummary } from "../components/market/PriceSummary";
import { PriceChart } from "../components/market/PriceChart";
import { NewsList } from "../components/news/NewsList";
import { AiInsightPanel } from "../components/ai/AiInsightPanel";
import {
  IndicatorControls,
  type Indicator,
} from "../components/market/IndicatorControls";

export type Timeframe = "1m" | "5m" | "1h" | "1d";

export default function HomePage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [showNewsMarkers, setShowNewsMarkers] = useState(true);

  const handleAddIndicator = (indicator: Indicator) => {
    setIndicators((prev) => [...prev, indicator]);
  };

  const handleRemoveIndicator = (id: string) => {
    setIndicators((prev) => prev.filter((ind) => ind.id !== id));
  };

  const handleToggleIndicator = (id: string) => {
    setIndicators((prev) =>
      prev.map((ind) =>
        ind.id === id ? { ...ind, visible: !ind.visible } : ind,
      ),
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[2fr_1.2fr] gap-4 p-4 md:p-6">
          {/* Left: market */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <SymbolSelector symbol={symbol} onChangeSymbol={setSymbol} />
                <TimeframeSelector
                  timeframe={timeframe}
                  onChangeTimeframe={setTimeframe}
                />
                <IndicatorControls
                  indicators={indicators}
                  onAddIndicator={handleAddIndicator}
                  onRemoveIndicator={handleRemoveIndicator}
                  onToggleIndicator={handleToggleIndicator}
                />
                <button
                  onClick={() => setShowNewsMarkers(!showNewsMarkers)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    showNewsMarkers
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                  title="Show/Hide news events on chart"
                >
                  {showNewsMarkers ? "Hide News" : "Show News"}
                </button>
              </div>
              <PriceSummary symbol={symbol} timeframe={timeframe} />
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 md:p-4 h-[460px]">
              <PriceChart
                symbol={symbol}
                timeframe={timeframe}
                indicators={indicators}
                showNewsMarkers={showNewsMarkers}
              />
            </div>
          </section>

          {/* Right: news + AI */}
          <section className="space-y-4">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 md:p-4 max-h-[260px] flex flex-col">
              <h2 className="text-sm font-semibold mb-2 flex items-center justify-between text-slate-800">
                <span>Latest News</span>
              </h2>
              <div className="flex-1 overflow-y-auto pr-1">
                <NewsList />
              </div>
            </div>

            <AiInsightPanel symbol={symbol} timeframe={timeframe} />
          </section>
        </div>
      </main>
    </div>
  );
}
