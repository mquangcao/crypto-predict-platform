"use client";

import { useEffect, useState } from "react";
import { predictionApi, PredictionResult } from "@/api/entities";
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

interface NewsPredictionBadgeProps {
  newsId: string;
  symbol?: string;
  timeframe?: string;
  compact?: boolean;
}

export function NewsPredictionBadge({
  newsId,
  symbol = "BTCUSDT",
  timeframe = "1h",
  compact = false,
}: NewsPredictionBadgeProps) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        if (!newsId) {
          setPrediction(null);
          return;
        }
        const result = await predictionApi.predictFromNewsId({
          newsId,
          symbol,
          timeframe,
        });
        setPrediction(result);
      } catch (error) {
        console.error("Error fetching prediction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [newsId, symbol, timeframe]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-700/40 border border-slate-600/40">
        <Zap className="w-3 h-3 text-slate-400 animate-pulse" />
        <span className="text-xs text-slate-400">분석중...</span>
      </div>
    );
  }

  if (!prediction?.success || !prediction?.prediction) {
    return null;
  }

  const { prediction: pred } = prediction;

  const signalConfig = {
    BUY: {
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/30",
      icon: TrendingUp,
      label: "MUA",
      shortLabel: "BUY",
    },
    SELL: {
      color: "text-rose-400",
      bgColor: "bg-rose-500/10 border-rose-500/30",
      icon: TrendingDown,
      label: "BÁN",
      shortLabel: "SELL",
    },
    NEUTRAL: {
      color: "text-slate-300",
      bgColor: "bg-slate-600/20 border-slate-600/30",
      icon: Minus,
      label: "TRUNG LẬP",
      shortLabel: "HOLD",
    },
    HOLD: {
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/30",
      icon: Minus,
      label: "GIỮ",
      shortLabel: "HOLD",
    },
  };

  const config = signalConfig[pred.signal] || signalConfig.NEUTRAL;
  const SignalIcon = config.icon;

  if (compact) {
    // Compact version for news list
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${config.bgColor}`}
        title={pred.reasoning}
      >
        <SignalIcon className={`w-3 h-3 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.shortLabel}
        </span>
        <span className={`text-xs ml-0.5 ${config.color}`}>
          {pred.predictedReturnPct > 0 ? "+" : ""}
          {pred.predictedReturnPct.toFixed(2)}%
        </span>
      </div>
    );
  }

  // Full version with tooltip/hover
  return (
    <div className="group relative">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-help ${config.bgColor}`}
      >
        <SignalIcon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.label}
        </span>
        <span className={`text-xs ml-1 ${config.color}`}>
          {pred.predictedReturnPct > 0 ? "+" : ""}
          {pred.predictedReturnPct.toFixed(2)}%
        </span>
      </div>

      {/* Tooltip */}
      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-lg z-50">
        <div className="text-xs text-slate-300 leading-relaxed">
          {pred.reasoning}
        </div>
        <div className="mt-2 text-[10px] text-slate-500">
          Latency: {prediction.metadata.latencyMs}ms
        </div>
      </div>
    </div>
  );
}
