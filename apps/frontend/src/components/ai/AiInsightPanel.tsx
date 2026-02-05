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
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 md:p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          AI Prediction
        </h2>
        <div className="flex justify-center items-center py-8">
          <div className="text-slate-500 text-sm">Analyzing...</div>
        </div>
      </div>
    );
  }

  if (error || !prediction?.success) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 md:p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          AI Prediction
        </h2>
        <div className="text-xs text-rose-600">
          {error || prediction?.error || "Failed to get prediction"}
        </div>
        <button
          onClick={fetchPrediction}
          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  const { prediction: pred } = prediction;
  if (!pred) return null;

  const signalConfig = {
    BUY: {
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
      icon: TrendingUp,
      label: "BUY",
    },
    SELL: {
      color: "text-rose-600",
      bgColor: "bg-rose-50 border-rose-200",
      icon: TrendingDown,
      label: "SELL",
    },
    NEUTRAL: {
      color: "text-slate-600",
      bgColor: "bg-slate-100 border-slate-200",
      icon: Minus,
      label: "NEUTRAL",
    },
    HOLD: {
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-200",
      icon: Minus,
      label: "HOLD",
    },
  };

  const config = signalConfig[pred.signal];
  const SignalIcon = config.icon;

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-800">AI Prediction</h2>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${config.bgColor}`}
        >
          <SignalIcon className={`w-3.5 h-3.5 ${config.color}`} />
          <span
            className={`text-xs font-semibold tracking-wide ${config.color}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500">Predicted move:</span>
          <span
            className={`text-lg font-bold ${pred.predictedReturnPct > 0 ? "text-emerald-600" : pred.predictedReturnPct < 0 ? "text-rose-600" : "text-slate-600"}`}
          >
            {pred.predictedReturnPct > 0 ? "+" : ""}
            {pred.predictedReturnPct.toFixed(2)}%
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          for <span className="font-mono text-slate-700">{symbol}</span> on{" "}
          {timeframe}
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
        <div className="text-xs text-slate-700 leading-relaxed">
          {pred.reasoning}
        </div>
      </div>

      {prediction.metadata && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200">
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
