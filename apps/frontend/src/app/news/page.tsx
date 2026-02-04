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
  }, [page]);

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
                Tin tức Crypto
              </h1>
              <p className="text-slate-600">
                Cập nhật tin tức mới nhất từ thị trường tiền điện tử
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
                <div className="text-slate-500 italic">Đang tải tin tức...</div>
              </div>
            )}

            {/* News Grid */}
            {!loading && news.length > 0 && (
              <>
                <div className="grid gap-4 mb-8">
                  {news.slice(0, displayCount).map((item) => (
                    <article
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-all cursor-pointer hover:border-indigo-300 shadow-sm"
                      onClick={() =>
                        item.url && window.open(item.url, "_blank")
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500 font-bold uppercase tracking-tight">
                            {item.source}
                          </span>
                          <span className="text-xs text-slate-400 font-medium italic">
                            {item.time}
                          </span>
                        </div>
                        <span
                          className={
                            "px-3 py-1 rounded-full text-xs capitalize font-bold border shadow-xs " +
                            sentimentColor[item.sentiment]
                          }
                        >
                          {item.sentiment}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 mb-2 leading-relaxed">
                        {item.title}
                      </h2>

                      {item.body && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>
                      )}

                      <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700">
                        <span>Đọc thêm →</span>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-md shadow-indigo-100"
                  >
                    ← Trang trước
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Trang</span>
                    <span className="text-slate-900 font-bold">{page}</span>
                    <span className="text-slate-500 font-medium">
                      / {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-md shadow-indigo-100"
                  >
                    Trang sau →
                  </button>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && news.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500 text-lg">Chưa có tin tức nào</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
