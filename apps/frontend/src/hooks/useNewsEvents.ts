"use client";

import { useEffect, useState } from "react";

export interface NewsEvent {
  id: string;
  title: string;
  source: string;
  sentiment: "bullish" | "bearish" | "neutral";
  publishedAt: string; // ISO timestamp
  timestamp: number; // Unix timestamp in seconds
  url?: string;
}

interface UseNewsEventsOptions {
  symbol?: string;
  startTime?: number; // Unix timestamp in seconds
  endTime?: number; // Unix timestamp in seconds
  limit?: number;
}

interface NewsApiResponse {
  statusCode: number;
  message: string;
  data: Array<{
    id: string;
    source: string;
    title: string;
    content?: string;
    sentiment: string;
    url?: string;
    publishedAt: string; // ISO timestamp from backend
    createdAt?: string;
    symbols?: string[];
  }>;
}

/**
 * Hook to fetch news events with timestamps for displaying markers on chart
 */
export function useNewsEvents(options: UseNewsEventsOptions = {}) {
  const { symbol, startTime, endTime, limit = 50 } = options;
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters - use general endpoint to avoid DB array issues
        const url = `/api/news?limit=${limit}`;

        console.log('[useNewsEvents] Fetching:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: NewsApiResponse = await response.json();
        console.log('[useNewsEvents] Response:', result);

        if (result.data && Array.isArray(result.data)) {
          const newsEvents: NewsEvent[] = result.data
            .map((item) => {
              // Parse timestamp from publishedAt
              let timestamp: number;
              if (item.publishedAt) {
                timestamp = Math.floor(new Date(item.publishedAt).getTime() / 1000);
              } else if (item.createdAt) {
                timestamp = Math.floor(new Date(item.createdAt).getTime() / 1000);
              } else {
                // Fallback to current time
                timestamp = Math.floor(Date.now() / 1000);
              }

              return {
                id: item.id,
                title: item.title,
                source: item.source,
                sentiment: (item.sentiment?.toLowerCase() || "neutral") as NewsEvent["sentiment"],
                publishedAt: item.publishedAt,
                timestamp,
                url: item.url,
              };
            })
            .filter((event) => {
              // Filter by symbol if provided (client-side filtering)
              if (symbol && event.title) {
                const symbolUpper = symbol.toUpperCase();
                const symbolBase = symbolUpper.replace('USDT', '').replace('USD', '');
                const titleUpper = event.title.toUpperCase();
                
                // Check if title contains the symbol or base currency
                if (!titleUpper.includes(symbolBase) && !titleUpper.includes(symbolUpper)) {
                  return false;
                }
              }
              
              // Filter by time range if provided
              if (startTime && event.timestamp < startTime) return false;
              if (endTime && event.timestamp > endTime) return false;
              return true;
            });

          console.log('[useNewsEvents] Parsed events:', newsEvents.length, newsEvents.slice(0, 3));
          setEvents(newsEvents);
        } else {
          console.warn('[useNewsEvents] No data in response');
          setEvents([]);
        }
      } catch (err: any) {
        console.error("[useNewsEvents] Error fetching news events:", err);
        setError(err.message || "Failed to fetch news");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol, startTime, endTime, limit]);

  return { events, loading, error };
}
