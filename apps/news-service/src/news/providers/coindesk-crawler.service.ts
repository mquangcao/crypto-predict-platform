import { Injectable } from '@nestjs/common';
import { UniversalWebCrawlerService, WebSource } from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class CoinDeskCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'coindesk',
      domain: 'coindesk.com',
      newsListUrl: 'https://www.coindesk.com/latest-crypto-news',
      // Target article cards - CoinDesk uses content-card-title class + href pattern /markets/YYYY/MM/DD/...
      articleLinkSelector: 'a.content-card-title[href*="/markets/"]',
      maxArticles: 20,
      waitForSelector: 'body',
    };
    
    super(source, aiParser);
  }
}
