import { Injectable } from '@nestjs/common';
import { UniversalWebCrawlerService, WebSource } from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class DecryptCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'decrypt',
      domain: 'decrypt.co',
      newsListUrl: 'https://decrypt.co',
      articleLinkSelector: 'a[href^="/news/"]',
      maxArticles: 15,
      waitForSelector: 'body',
    };
    
    super(source, aiParser);
  }
}
