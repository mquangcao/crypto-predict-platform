"use client";

import { useEffect, useState } from "react";
import { NewsItemWithPrediction } from "@/components/news/NewsItemWithPrediction";

interface NewsItem {
  id: string;
  source: string;
  title: string;
  time: string;
  sentiment: string;
  url?: string;
  body?: string;
  published_at?: string;
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?limit=${LIMIT}`);
      const result: NewsResponse = await response.json();

      if (result.data && Array.isArray(result.data)) {
        setNews(result.data);
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
