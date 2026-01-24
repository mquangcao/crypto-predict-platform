"use client";

import { Timeframe } from "../../app/page";

type Props = {
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
};

const timeframes: Timeframe[] = ["1m", "5m", "1h", "1d"];

export function TimeframeSelector({ timeframe, onChangeTimeframe }: Props) {
  return (
    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-1 py-1 shadow-sm">
      {timeframes.map((tf) => {
        const isActive = tf === timeframe;
        return (
          <button
            key={tf}
            type="button"
            onClick={() => onChangeTimeframe(tf)}
            className={
              "px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide transition-all " +
              (isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900")
            }
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
}
