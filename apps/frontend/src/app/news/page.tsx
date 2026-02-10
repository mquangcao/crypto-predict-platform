"use client";

import { useEffect, useState } from "react";
import { NewsItemWithPrediction } from "@/components/news/NewsItemWithPrediction";

interface NewsItem {
  id: string;
  source: string;
  title: string;
  content: string;
  publishedAt: string;
  url?: string;
  sentiment?: string;
  symbols?: string[];
  author?: string;
}

interface MappedNewsItem {
  id: string;
  source: string;
  title: string;
  time: string;
  sentiment: string;
  url?: string;
  body?: string;
}

interface NewsResponse {
  statusCode: number;
  message: string;
  data: NewsItem[];
}

const sentimentColor: Record<string, string> = {
  bullish: "text-emerald-700 bg-emerald-100 border-emerald-200",
  bearish: "text-rose-700 bg-rose-100 border-rose-200",
  neutral: "text-slate-600 bg-slate-100 border-slate-200",
};

const LIMIT = 50;

export default function NewsPage() {
  const [news, setNews] = useState<MappedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Determine sentiment from title and content
  const determineSentiment = (title: string, content: string): string => {
    const text = `${title} ${content}`.toLowerCase();

    const bullishWords = [
      "surge",
      "soar",
      "rally",
      "pump",
      "gain",
      "rise",
      "spike",
      "bull",
      "moon",
      "bull run",
      "breakout",
      "recovery",
      "strong",
      "bullish",
      "positive",
      "optimism",
      "up",
      "higher",
      "growth",
      "profit",
    ];

    const bearishWords = [
      "crash",
      "plunge",
      "dump",
      "fall",
      "drop",
      "decline",
      "bear",
      "bearish",
      "down",
      "lower",
      "negative",
      "pessimism",
      "loss",
      "weakness",
      "weak",
      "fear",
      "liquidation",
      "collapse",
    ];

    const bullishCount = bullishWords.filter((word) =>
      text.includes(word),
    ).length;
    const bearishCount = bearishWords.filter((word) =>
      text.includes(word),
    ).length;

    if (bullishCount > bearishCount) return "bullish";
    if (bearishCount > bullishCount) return "bearish";
    return "neutral";
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?limit=${LIMIT}`);
      const result: NewsResponse = await response.json();

      if (result.data && Array.isArray(result.data)) {
        const mappedNews: MappedNewsItem[] = result.data.map((item) => ({
          id: item.id,
          source: item.source,
          title: item.title,
          time: formatDate(item.publishedAt),
          sentiment:
            item.sentiment || determineSentiment(item.title, item.content),
          url: item.url,
          body: item.content,
        }));
        setNews(mappedNews);
      } else {
        console.error("API response is not in expected format:", result);
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
    // Refresh mỗi 5 phút
    const interval = setInterval(() => fetchNews(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 10, news.length));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Crypto News
              </h1>
              <p className="text-slate-600">
                Latest updates from the cryptocurrency market with AI-powered
                price predictions
              </p>
              {news.length > 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  Showing {displayCount} / {news.length} articles
                </p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="text-slate-500 italic">Loading news...</div>
              </div>
            )}

            {/* News Grid */}
            {!loading && news.length > 0 && (
              <>
                <div className="grid gap-4 mb-8">
                  {news.slice(0, displayCount).map((item) => (
                    <NewsItemWithPrediction
                      key={item.id}
                      newsItem={item}
                      sentimentColor={sentimentColor}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {displayCount < news.length && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-bold shadow-md shadow-indigo-100"
                    >
                      Load more ({news.length - displayCount} articles
                      remaining)
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && news.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500 text-lg">No news available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
