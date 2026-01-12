export interface SentimentResult {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence?: number;
}

export interface SentimentQueueMessage {
  articleId: string;
  title: string;
  content: string;
  task: string;
  timestamp: string;
}
