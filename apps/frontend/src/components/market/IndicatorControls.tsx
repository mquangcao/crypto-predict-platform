"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export type IndicatorType = "SMA" | "EMA" | "BB" | "RSI";

export interface Indicator {
  id: string;
  type: IndicatorType;
  period: number;
  color: string;
  visible: boolean;
}

interface Props {
  indicators: Indicator[];
  onAddIndicator: (indicator: Indicator) => void;
  onRemoveIndicator: (id: string) => void;
  onToggleIndicator: (id: string) => void;
}

const INDICATOR_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#10b981", // emerald
  "#ec4899", // pink
  "#06b6d4", // cyan
];

const INDICATOR_NAMES: Record<IndicatorType, string> = {
  SMA: "Simple Moving Average",
  EMA: "Exponential Moving Average",
  BB: "Bollinger Bands",
  RSI: "Relative Strength Index",
};

export function IndicatorControls({
  indicators,
  onAddIndicator,
  onRemoveIndicator,
  onToggleIndicator,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<IndicatorType>("SMA");
  const [period, setPeriod] = useState(20);

  const handleAdd = () => {
    const colorIndex = indicators.length % INDICATOR_COLORS.length;
    const newIndicator: Indicator = {
      id: `${selectedType}-${period}-${Date.now()}`,
      type: selectedType,
      period,
      color: INDICATOR_COLORS[colorIndex],
      visible: true,
    };
    onAddIndicator(newIndicator);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Indicators
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-3">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Indicator Type
              </label>
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as IndicatorType)
                }
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(INDICATOR_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Period
              </label>
              <input
                type="number"
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value) || 20)}
                min="2"
                max="200"
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Indicators */}
      {indicators.length > 0 && (
        <div className="absolute top-full left-0 mt-1 flex flex-wrap gap-1 max-w-md">
          {indicators.map((ind) => (
            <div
              key={ind.id}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-all ${
                ind.visible
                  ? "bg-white border-slate-200"
                  : "bg-slate-50 border-slate-100 opacity-60"
              }`}
            >
              <button
                onClick={() => onToggleIndicator(ind.id)}
                className="flex items-center gap-1 hover:opacity-80"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ind.color }}
                />
                <span className="font-medium" style={{ color: ind.color }}>
                  {ind.type}({ind.period})
                </span>
              </button>
              <button
                onClick={() => onRemoveIndicator(ind.id)}
                className="ml-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
