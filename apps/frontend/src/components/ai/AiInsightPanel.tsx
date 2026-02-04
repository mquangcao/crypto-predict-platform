"use client";

import { useEffect, useState } from "react";
import { predictionApi, PredictionResult } from "@/api/entities";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AiInsightPanelProps {
  symbol?: string;
  timeframe?: string;
}

export function AiInsightPanel({
  symbol = "BTCUSDT",
  timeframe = "1h",
}: AiInsightPanelProps) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call quick prediction API with default sentiment (you can enhance this later)
      const result = await predictionApi.quickPredict({
        symbol,
        timeframe,
        sentiment: 0, // Default neutral, will be replaced with real sentiment later
      });

      setPrediction(result);
    } catch (err: any) {
      console.error("Error fetching prediction:", err);
      setError(err.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrediction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4">
        <h2 className="text-sm font-semibold mb-2">AI Prediction</h2>
        <div className="flex justify-center items-center py-8">
          <div className="text-slate-400 text-sm">Đang phân tích...</div>
        </div>
      </div>
    );
  }

  if (error || !prediction?.success) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4">
        <h2 className="text-sm font-semibold mb-2">AI Prediction</h2>
        <div className="text-xs text-rose-400">
          {error || prediction?.error || "Failed to get prediction"}
        </div>
        <button
          onClick={fetchPrediction}
          className="mt-2 text-xs text-blue-400 hover:text-blue-300"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { prediction: pred } = prediction;
  if (!pred) return null;

  const signalConfig = {
    BUY: {
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/30",
      icon: TrendingUp,
      label: "MUA",
    },
    SELL: {
      color: "text-rose-400",
      bgColor: "bg-rose-500/10 border-rose-500/30",
      icon: TrendingDown,
      label: "BÁN",
    },
    NEUTRAL: {
      color: "text-slate-300",
      bgColor: "bg-slate-600/20 border-slate-600/30",
      icon: Minus,
      label: "TRUNG LẬP",
    },
    HOLD: {
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/30",
      icon: Minus,
      label: "GIỮ",
    },
  };

  const config = signalConfig[pred.signal];
  const SignalIcon = config.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">AI Prediction</h2>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${config.bgColor}`}
        >
          <SignalIcon className={`w-3.5 h-3.5 ${config.color}`} />
          <span className={`text-xs font-bold ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-400">Dự báo biến động:</span>
          <span
            className={`text-lg font-bold ${pred.predictedReturnPct > 0 ? "text-emerald-400" : pred.predictedReturnPct < 0 ? "text-rose-400" : "text-slate-300"}`}
          >
            {pred.predictedReturnPct > 0 ? "+" : ""}
            {pred.predictedReturnPct.toFixed(2)}%
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          cho cặp <span className="font-mono text-slate-400">{symbol}</span>{" "}
          trong {timeframe}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-2.5">
        <div className="text-xs text-slate-300 leading-relaxed">
          {pred.reasoning}
        </div>
      </div>

      {prediction.metadata && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500">
            Model: {prediction.metadata.endpointName}
          </span>
          <span className="text-[10px] text-slate-500">
            Latency: {prediction.metadata.latencyMs}ms
          </span>
        </div>
      )}
    </div>
  );
}
