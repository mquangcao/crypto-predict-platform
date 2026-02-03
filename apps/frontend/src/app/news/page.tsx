"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";

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
  bullish: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  bearish: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  neutral: "text-slate-300 bg-slate-600/20 border-slate-600/30",
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Tin tức Crypto
              </h1>
              <p className="text-slate-400">
                Cập nhật tin tức mới nhất từ thị trường tiền điện tử với AI
                predictions
              </p>
              {news.length > 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  Hiển thị {displayCount} / {news.length} tin tức
                </p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="text-slate-400">Đang tải tin tức...</div>
              </div>
            )}

            {/* News Grid */}
            {!loading && news.length > 0 && (
              <>
                <div className="grid gap-4 mb-8">
                  {news.slice(0, displayCount).map((item) => (
                    <article
                      key={item.id}
                      className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:bg-slate-900/80 transition-all cursor-pointer hover:border-indigo-500/50"
                      onClick={() =>
                        item.url && window.open(item.url, "_blank")
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">
                            {item.source}
                          </span>
                          <span className="text-xs text-slate-500">
                            {item.time}
                          </span>
                        </div>
                        <span
                          className={
                            "px-3 py-1 rounded-full text-xs capitalize font-medium border " +
                            sentimentColor[item.sentiment]
                          }
                        >
                          {item.sentiment}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold text-white mb-2 leading-relaxed">
                        {item.title}
                      </h2>

                      {item.body && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {item.body}
                        </p>
                      )}

                      <div className="mt-4 flex items-center text-xs text-indigo-400 hover:text-indigo-300">
                        <span>Đọc thêm →</span>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Load More */}
                {displayCount < news.length && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition font-medium"
                    >
                      Xem thêm ({news.length - displayCount} tin còn lại)
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && news.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-400 text-lg">Chưa có tin tức nào</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
