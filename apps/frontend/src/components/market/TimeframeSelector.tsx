"use client";

import { Timeframe } from "../../app/page";

type Props = {
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
};

const timeframes: Timeframe[] = ["1m", "5m", "1h", "1d"];

export function TimeframeSelector({ timeframe, onChangeTimeframe }: Props) {
  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-1 py-1">
      {timeframes.map((tf) => {
        const isActive = tf === timeframe;
        return (
          <button
            key={tf}
            type="button"
            onClick={() => onChangeTimeframe(tf)}
            className={
              "px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wide " +
              (isActive
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-slate-800")
            }
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
}
