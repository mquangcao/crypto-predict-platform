import { Injectable } from '@nestjs/common';
import { UniversalWebCrawlerService, WebSource } from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class TheBlockCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'theblock',
      domain: 'theblock.co',
      newsListUrl: 'https://www.theblock.co/latest',
      articleLinkSelector: 'article a.articleCard, a[href*="/post/"]',
      maxArticles: 10,
      waitForSelector: 'article',
    };
    
    super(source, aiParser);
  }
}
