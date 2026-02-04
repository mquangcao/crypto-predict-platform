"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";
import { NewsPredictionBadge } from "../../components/news/NewsPredictionBadge";
import { Zap, Filter } from "lucide-react";

interface NewsItem {
  id: string;
  source: string;
  title: string;
  time: string;
  sentiment?: string;
  url?: string;
  body?: string;
  published_at?: string;
}

interface NewsResponse {
  statusCode: number;
  message: string;
  data: NewsItem[];
}

const sentimentConfig = {
  positive: {
    label: "Bullish",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  neutral: {
    label: "Neutral",
    color: "text-slate-300 bg-slate-600/20 border-slate-600/30",
  },
  negative: {
    label: "Bearish",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
};

const SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "XRPUSDT",
];
const TIMEFRAMES = ["1m", "5m", "1h", "4h", "1d"];
const LIMIT = 100;

const getHoursAgo = (dateStr: string): number => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  } catch {
    return 0;
  }
};

export default function AIPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(12);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("");

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?limit=${LIMIT}`);
      const result: NewsResponse = await response.json();

      if (result.data && Array.isArray(result.data)) {
        setNews(result.data);
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply filters
  const filteredNews = news.filter((item) => {
    // Sentiment filter
    if (selectedSentiment && item.sentiment !== selectedSentiment) {
      return false;
    }

    // Time range filter
    if (selectedTimeRange) {
      const hoursAgo = getHoursAgo(item.published_at || item.time);
      switch (selectedTimeRange) {
        case "1h":
          if (hoursAgo > 1) return false;
          break;
        case "6h":
          if (hoursAgo > 6) return false;
          break;
        case "24h":
          if (hoursAgo > 24) return false;
          break;
        case "7d":
          if (hoursAgo > 168) return false;
          break;
      }
    }

    return true;
  });

  const stats = {
    total: filteredNews.length,
    positive: filteredNews.filter((n) => n.sentiment === "positive").length,
    neutral: filteredNews.filter((n) => n.sentiment === "neutral").length,
    negative: filteredNews.filter((n) => n.sentiment === "negative").length,
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-indigo-500" />
                  <h1 className="text-4xl font-bold text-white">
                    AI Predictions
                  </h1>
                </div>
                <p className="text-slate-400 text-lg">
                  Phân tích dự đoán AI cho từng tin tức với các tùy chọn linh
                  hoạt
                </p>
              </div>

              {/* Filters Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Tùy chọn lọc
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Symbol */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                      Symbol
                    </label>
                    <select
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
                    >
                      {SYMBOLS.map((sym) => (
                        <option key={sym} value={sym}>
                          {sym}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timeframe */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                      Timeframe
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
                    >
                      {TIMEFRAMES.map((tf) => (
                        <option key={tf} value={tf}>
                          {tf}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sentiment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                      Sentiment
                    </label>
                    <select
                      value={selectedSentiment}
                      onChange={(e) => setSelectedSentiment(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
                    >
                      <option value="">Tất cả</option>
                      <option value="positive">Bullish (+)</option>
                      <option value="neutral">Neutral (=)</option>
                      <option value="negative">Bearish (-)</option>
                    </select>
                  </div>

                  {/* Time Range */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                      Khoảng thời gian
                    </label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
                    >
                      <option value="">Tất cả</option>
                      <option value="1h">1 giờ qua</option>
                      <option value="6h">6 giờ qua</option>
                      <option value="24h">24 giờ qua</option>
                      <option value="7d">7 ngày qua</option>
                    </select>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stats.total}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Tổng tin tức
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.positive}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Bullish</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-300">
                      {stats.neutral}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-400">
                      {stats.negative}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Bearish</div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-24">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-indigo-500/50 mx-auto mb-4 animate-pulse" />
                    <div className="text-slate-400">Đang tải dữ liệu...</div>
                  </div>
                </div>
              )}

              {/* News Grid */}
              {!loading && filteredNews.length > 0 && (
                <>
                  <div className="grid gap-4 mb-8">
                    {filteredNews.slice(0, displayCount).map((item) => (
                      <article
                        key={item.id}
                        className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/10"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                                {item.source}
                              </span>
                              <span className="text-xs text-slate-500">
                                {item.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.sentiment && (
                              <span
                                className={
                                  "px-2.5 py-1 rounded-full text-xs font-semibold border " +
                                  sentimentConfig[
                                    item.sentiment as keyof typeof sentimentConfig
                                  ]?.color
                                }
                              >
                                {sentimentConfig[
                                  item.sentiment as keyof typeof sentimentConfig
                                ]?.label || item.sentiment}
                              </span>
                            )}
                            <NewsPredictionBadge
                              newsId={item.id}
                              symbol={selectedSymbol}
                              timeframe={selectedTimeframe}
                              compact={false}
                            />
                          </div>
                        </div>

                        <h2 className="text-base font-semibold text-white mb-2 leading-relaxed group-hover:text-indigo-300 transition">
                          {item.title}
                        </h2>

                        {item.body && (
                          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                            {item.body}
                          </p>
                        )}

                        <div className="flex items-center text-xs text-indigo-400 group-hover:text-indigo-300 transition">
                          <span>Đọc thêm</span>
                          <span className="ml-1">→</span>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Load More */}
                  {displayCount < filteredNews.length && (
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          setDisplayCount((prev) =>
                            Math.min(prev + 12, filteredNews.length),
                          )
                        }
                        className="px-8 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition font-medium shadow-lg hover:shadow-indigo-500/50"
                      >
                        Xem thêm ({filteredNews.length - displayCount} tin còn
                        lại)
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!loading && filteredNews.length === 0 && (
                <div className="text-center py-20">
                  <Zap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Không có tin tức nào phù hợp với filter
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Thử thay đổi các tùy chọn lọc
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
