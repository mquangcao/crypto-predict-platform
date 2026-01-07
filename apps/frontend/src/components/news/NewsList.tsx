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
  bullish: "text-emerald-400 bg-emerald-500/10",
  bearish: "text-rose-400 bg-rose-500/10",
  neutral: "text-slate-300 bg-slate-600/20",
};

export function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/news?page=${pageNum}&limit=10`);
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
        <div className="text-slate-400 text-sm">Đang tải tin tức...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 space-y-2 text-xs overflow-y-auto">
        {news.map((n) => (
          <li
            key={n.id}
            className="px-2 py-1 rounded-lg hover:bg-slate-800/70 cursor-pointer transition"
            onClick={() => n.url && window.open(n.url, "_blank")}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] text-slate-400">{n.source}</span>
              <span
                className={
                  "px-1.5 py-0.5 rounded-full text-[10px] capitalize " +
                  sentimentColor[n.sentiment]
                }
              >
                {n.sentiment}
              </span>
            </div>
            <div className="text-[13px] leading-snug">{n.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{n.time}</div>
          </li>
        ))}
      </ul>
      
      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-3 py-1 text-xs rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Trước
        </button>
        <span className="text-xs text-slate-400">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-3 py-1 text-xs rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
