"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  source: string;
  title: string;
  time: string;
  sentiment: string;
  url?: string;
}

interface NewsResponse {
  data: NewsItem[];
  total: number;
  page: number;
  totalPages: number;
}

const sentimentColor: Record<string, string> = {
  bullish: "text-emerald-700 bg-emerald-100 font-bold",
  bearish: "text-rose-700 bg-rose-100 font-bold",
  neutral: "text-slate-600 bg-slate-100 font-medium",
};

export function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3002/news?page=${pageNum}&limit=10`,
      );
      const data: NewsResponse = await response.json();

      if (data.data && Array.isArray(data.data)) {
        setNews(data.data);
        setTotalPages(data.totalPages);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-slate-500 text-sm italic">Đang tải tin tức...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 space-y-2 text-xs overflow-y-auto">
        {news.map((n) => (
          <li
            key={n.id}
            className="px-2 py-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all"
            onClick={() => n.url && window.open(n.url, "_blank")}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                {n.source}
              </span>
              <span
                className={
                  "px-1.5 py-0.5 rounded-full text-[9px] capitalize shadow-sm " +
                  sentimentColor[n.sentiment]
                }
              >
                {n.sentiment}
              </span>
            </div>
            <div className="text-[13px] leading-snug font-medium text-slate-800 line-clamp-2">
              {n.title}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium italic">
              {n.time}
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-3 py-1.5 text-xs rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          Trước
        </button>
        <span className="text-xs text-slate-500 font-medium">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-xs rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
