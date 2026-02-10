import { client as axios } from '../axios';

export interface SentimentData {
  newsId: string;
  sentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  confidence: number;
  model: string;
  analyzedAt: string;
}

export interface SentimentResponse {
  statusCode: number;
  message: string;
  data: SentimentData | null;
}

export interface BatchSentimentsResponse {
  statusCode: number;
  message: string;
  data: SentimentData[];
}

export const sentimentApi = {
  /**
   * Get sentiment for a specific news article (VIP only)
   */
  async getSentiment(newsId: string): Promise<SentimentData> {
    const { data } = await axios.get(`/sentiment/${newsId}`);
    return data.data;
  },

  /**
   * Get sentiments for multiple news articles (VIP only)
   */
  async getBatchSentiments(): Promise<SentimentData[]> {
    const { data } = await axios.get('/sentiment/batch');
    return data.data;
  },
};
