export class CreateNewsDto {
  source: string;
  externalId: string;
  title: string;
  content: string;
  url: string;
  publishedAt: Date;
  symbols: string[];
  author?: string;
  raw?: any;
}