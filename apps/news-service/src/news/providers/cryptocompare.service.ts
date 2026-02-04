import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateNewsDto } from '../dto/create-news.dto';
import { NewsCrawler } from '../interfaces/news-crawler.interface';
import { mapCategoriesToSymbols } from '../utils/symbol-mapper';

@Injectable()
export class CryptoCompareService implements NewsCrawler {
  private readonly logger = new Logger(CryptoCompareService.name);
  public readonly sourceName = 'cryptocompare';

  constructor(private readonly httpService: HttpService) {}

  async fetchNews(): Promise<CreateNewsDto[]> {
    try {
      this.logger.log('📡 Fetching news from CryptoCompare API...');
      
      const url = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';
      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data || !data.Data || !Array.isArray(data.Data)) {
        this.logger.warn('CryptoCompare returned empty or invalid data');
        return [];
      }

      const rawArticles = data.Data;

      return rawArticles.map((item: any) => {
        // Parse categories and convert to valid trading symbols
        const categories = item.categories ? item.categories.split('|') : [];
        const tradingSymbols = mapCategoriesToSymbols(categories);
        
        return {
          source: this.sourceName,
          externalId: String(item.id),
          title: item.title,
          content: item.body,
          url: item.url,
          publishedAt: new Date(item.published_on * 1000), 
          symbols: tradingSymbols, // Now contains valid Binance symbols
          author: item.source,
          raw: item,
        };
      });

    } catch (error) {
      this.logger.error(`❌ Error fetching from CryptoCompare: ${error.message}`);
      return [];
    }
  }
}