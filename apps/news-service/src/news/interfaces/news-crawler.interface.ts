import { CreateNewsDto } from '../dto/create-news.dto';

export interface NewsCrawler {
  sourceName: string;
  fetchNews(): Promise<CreateNewsDto[]>;
}