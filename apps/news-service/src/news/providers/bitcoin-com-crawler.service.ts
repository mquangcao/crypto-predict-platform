import { Injectable } from '@nestjs/common';
import { UniversalWebCrawlerService, WebSource } from '../services/universal-web-crawler.service';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

@Injectable()
export class BitcoinComCrawlerService extends UniversalWebCrawlerService {
  constructor(aiParser: AiHtmlParserService) {
    const source: WebSource = {
      name: 'bitcoin-com',
      domain: 'bitcoin.com',
      newsListUrl: 'https://news.bitcoin.com/',
      articleLinkSelector: 'article a[href*="/news/"], .jeg_postblock a.jeg_post_title',
      maxArticles: 10,
      waitForSelector: 'article',
    };
    
    super(source, aiParser);
  }
}
