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
  statusCode: number;
  message: string;
  data: NewsItem[];
}

const sentimentColor: Record<string, string> = {
  bullish: "text-emerald-400 bg-emerald-500/10",
  bearish: "text-rose-400 bg-rose-500/10",
  neutral: "text-slate-300 bg-slate-600/20",
};

export function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?limit=10`);
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
              <span className="text-[11px] text-slate-400 flex-shrink-0">
                {n.source}
              </span>
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
    </div>
  );
}
