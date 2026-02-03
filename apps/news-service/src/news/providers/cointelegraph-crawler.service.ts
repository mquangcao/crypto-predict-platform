import { Injectable } from '@nestjs/common';
import { UniversalWebCrawlerService, WebSource } from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class CoinTelegraphCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'cointelegraph',
      domain: 'cointelegraph.com',
      newsListUrl: 'https://cointelegraph.com/news',
      articleLinkSelector: '.post-card__title-link, article a.post-card-inline__title-link',
      maxArticles: 10,
      waitForSelector: '.post-card',
    };
    
    super(source, aiParser);
  }
}
