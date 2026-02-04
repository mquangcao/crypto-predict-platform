import { Injectable } from '@nestjs/common';
import { UniversalWebCrawlerService, WebSource } from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class CoinDeskCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'coindesk',
      domain: 'coindesk.com',
      newsListUrl: 'https://www.coindesk.com/livewire/',
      articleLinkSelector: 'article a[href*="/livewire/"], .article-cardstyles a',
      maxArticles: 10,
      waitForSelector: 'article',
    };
    
    super(source, aiParser);
  }
}
