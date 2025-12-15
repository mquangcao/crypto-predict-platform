export class NewsItemDto {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: string;
  url?: string;
  published_at: string;
}

export class NewsResponseDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewsItemDto[];
}
