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
  data: NewsItem[];
  total: number;
  page: number;
  totalPages: number;
}

const sentimentColor: Record<string, string> = {
  bullish: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  bearish: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  neutral: "text-slate-300 bg-slate-600/20 border-slate-600/30",
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNews = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/news?page=${pageNum}&limit=10`);
      const data: NewsResponse = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setNews(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setPage(data.page);
      } else {
        console.error("API response is not in expected format:", data);
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
    fetchNews(1);
    // Refresh mỗi 5 phút
    const interval = setInterval(() => fetchNews(page), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchNews(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchNews(page - 1);
    }
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
                Cập nhật tin tức mới nhất từ thị trường tiền điện tử
              </p>
              {total > 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  Tổng cộng {total} tin tức
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
                  {news.map((item) => (
                    <article
                      key={item.id}
                      className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:bg-slate-900/80 transition-all cursor-pointer hover:border-indigo-500/50"
                      onClick={() => item.url && window.open(item.url, "_blank")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">{item.source}</span>
                          <span className="text-xs text-slate-500">{item.time}</span>
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

                {/* Pagination */}
                <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    ← Trang trước
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      Trang
                    </span>
                    <span className="text-white font-semibold">
                      {page}
                    </span>
                    <span className="text-slate-400">
                      / {totalPages}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    Trang sau →
                  </button>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && news.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-400 text-lg">
                  Chưa có tin tức nào
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
