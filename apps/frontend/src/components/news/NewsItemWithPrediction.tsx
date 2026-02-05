"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { predictionApi, PredictionResult } from "@/api/entities";
import { useCheckVip, useAuth } from "@/hooks";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  ChevronDown,
  ChevronUp,
  Crown,
  Lock,
} from "lucide-react";

interface NewsItemWithPredictionProps {
  newsItem: {
    id: string;
    source: string;
    title: string;
    time: string;
    sentiment: string;
    url?: string;
    body?: string;
  };
  sentimentColor: Record<string, string>;
}

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"];
const TIMEFRAMES = ["1h", "4h", "1d"];

export function NewsItemWithPrediction({
  newsItem,
  sentimentColor,
}: NewsItemWithPredictionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: vipData } = useCheckVip({
    options: {
      enabled: !!user && user.role !== "ADMIN",
    },
  });

  const isVip = !!vipData?.data || user?.role === "ADMIN";

  const [showPrediction, setShowPrediction] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await predictionApi.predictFromNewsId({
        newsId: newsItem.id,
        symbol: selectedSymbol,
        timeframe: selectedTimeframe,
      });
      setPrediction(result);
    } catch (err: any) {
      console.error("Error fetching prediction:", err);
      setError(err.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrediction = () => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If user is not VIP, don't allow toggle
    if (!isVip) {
      return;
    }

    const newState = !showPrediction;
    setShowPrediction(newState);
    if (newState && !prediction) {
      fetchPrediction();
    }
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    setPrediction(null); // Clear old prediction
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    setPrediction(null); // Clear old prediction
  };

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

  return (
    <article className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
      {/* Main News Content */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => newsItem.url && window.open(newsItem.url, "_blank")}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-bold uppercase tracking-tight">
              {newsItem.source}
            </span>
            <span className="text-xs text-slate-400 font-medium italic">
              {newsItem.time}
            </span>
          </div>
          <span
            className={
              "px-3 py-1 rounded-full text-xs capitalize font-bold border shadow-xs " +
              sentimentColor[newsItem.sentiment]
            }
          >
            {newsItem.sentiment}
          </span>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2 leading-relaxed">
          {newsItem.title}
        </h2>

        {newsItem.body && (
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {newsItem.body}
          </p>
        )}

        <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700">
          <span>Read more →</span>
        </div>
      </div>

      {/* AI Prediction Toggle Button */}
      <div className="px-6 pb-4">
        {!user ? (
          // Not logged in - prompt to login
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                Login to view AI Predictions
              </span>
            </div>
          </button>
        ) : !isVip ? (
          // Logged in but not VIP - prompt to upgrade
          <button
            onClick={() => router.push("/pricing")}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border border-amber-300 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                Upgrade to VIP for AI Predictions
              </span>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
              VIP ONLY
            </span>
          </button>
        ) : (
          // VIP user - show prediction toggle
          <button
            onClick={handleTogglePrediction}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">
                AI Price Prediction
              </span>
            </div>
            {showPrediction ? (
              <ChevronUp className="w-4 h-4 text-indigo-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        )}
      </div>

      {/* Prediction Panel */}
      {showPrediction && (
        <div className="px-6 pb-6 border-t border-slate-200 pt-4">
          {/* Symbol and Timeframe Selection */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Trading Pair
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {SYMBOLS.map((sym) => (
                  <option key={sym} value={sym}>
                    {sym}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Timeframe
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Get Prediction Button */}
          <button
            onClick={fetchPrediction}
            disabled={loading}
            className="w-full mb-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            {loading ? "Analyzing..." : "Get Prediction"}
          </button>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center gap-2 text-indigo-600">
                <Zap className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">
                  Analyzing market data...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Prediction Result */}
          {prediction &&
            prediction.success &&
            prediction.prediction &&
            !loading && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                {/* Signal Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-600">
                    Signal
                  </span>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                      signalConfig[prediction.prediction.signal]?.bgColor
                    }`}
                  >
                    {(() => {
                      const SignalIcon =
                        signalConfig[prediction.prediction.signal]?.icon;
                      return SignalIcon ? (
                        <SignalIcon
                          className={`w-4 h-4 ${
                            signalConfig[prediction.prediction.signal]?.color
                          }`}
                        />
                      ) : null;
                    })()}
                    <span
                      className={`text-sm font-bold ${
                        signalConfig[prediction.prediction.signal]?.color
                      }`}
                    >
                      {signalConfig[prediction.prediction.signal]?.label}
                    </span>
                  </div>
                </div>

                {/* Predicted Return */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-600">
                      Predicted move:
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        prediction.prediction.predictedReturnPct > 0
                          ? "text-emerald-600"
                          : prediction.prediction.predictedReturnPct < 0
                            ? "text-rose-600"
                            : "text-slate-600"
                      }`}
                    >
                      {prediction.prediction.predictedReturnPct > 0 ? "+" : ""}
                      {prediction.prediction.predictedReturnPct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    for{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {selectedSymbol}
                    </span>{" "}
                    on {selectedTimeframe}
                  </div>
                </div>

                {/* Reasoning */}
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-medium mb-1">
                    Analysis
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {prediction.prediction.reasoning}
                  </p>
                </div>

                {/* Metadata */}
                {prediction.metadata && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500">
                      Model: {prediction.metadata.endpointName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Latency: {prediction.metadata.latencyMs}ms
                    </span>
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </article>
  );
}
