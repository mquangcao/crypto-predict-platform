import { Injectable } from '@nestjs/common';
import { UniversalWebCrawlerService, WebSource } from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class DecryptCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'decrypt',
      domain: 'decrypt.co',
      newsListUrl: 'https://decrypt.co/news',
      articleLinkSelector: 'article a[href*="/news/"], .article-title a',
      maxArticles: 10,
      waitForSelector: 'article',
    };
    
    super(source, aiParser);
  }
}
