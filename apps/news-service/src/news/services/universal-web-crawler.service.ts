import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import { CreateNewsDto } from '../dto/create-news.dto';
import { NewsCrawler } from '../interfaces/news-crawler.interface';
import { AiHtmlParserService } from '../services/ai-html-parser.service';

export interface WebSource {
  name: string;
  domain: string;
  newsListUrl: string;
  articleLinkSelector: string; // CSS selector để tìm links bài viết
  maxArticles?: number;
  waitForSelector?: string; // Selector để đợi page load xong
}

/**
 * Universal Web Crawler - Crawl từ bất kỳ website nào
 * Sử dụng Playwright để render JS và AI để parse HTML
 */
@Injectable()
export class UniversalWebCrawlerService implements NewsCrawler {
  private readonly logger = new Logger(UniversalWebCrawlerService.name);
  public readonly sourceName: string;
  private browser: Browser | null = null;

  constructor(
    private readonly source: WebSource,
    private readonly aiParser: AiHtmlParserService,
  ) {
    this.sourceName = source.name;
  }

  /**
   * Khởi tạo browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  /**
   * Đóng browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Fetch danh sách URLs bài viết từ trang chủ
   */
  private async fetchArticleUrls(): Promise<string[]> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      this.logger.log(`📄 Navigating to ${this.source.newsListUrl}`);
      
      await page.goto(this.source.newsListUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Đợi content load
      if (this.source.waitForSelector) {
        await page.waitForSelector(this.source.waitForSelector, { timeout: 10000 });
      } else {
        await page.waitForTimeout(2000); // Fallback wait
      }

      // Lấy tất cả links bài viết
      const links = await page.$$eval(
        this.source.articleLinkSelector,
        (elements, baseUrl) => {
          return elements
            .map((el) => {
              const href = el.getAttribute('href');
              if (!href) return null;
              
              // Convert relative URL to absolute
              if (href.startsWith('http')) return href;
              if (href.startsWith('/')) return new URL(href, baseUrl).href;
              return null;
            })
            .filter((url): url is string => url !== null);
        },
        this.source.newsListUrl,
      );

      // Loại bỏ duplicates và giới hạn số lượng
      const uniqueLinks = Array.from(new Set(links));
      const maxArticles = this.source.maxArticles || 10;
      const limitedLinks = uniqueLinks.slice(0, maxArticles);

      this.logger.log(`🔗 Found ${limitedLinks.length} article URLs`);
      return limitedLinks;

    } catch (error) {
      this.logger.error(`Error fetching article URLs: ${error.message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Crawl một bài viết từ URL
   */
  private async crawlArticle(url: string): Promise<CreateNewsDto | null> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      this.logger.log(`📰 Crawling article: ${url}`);

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Đợi content render
      await page.waitForTimeout(1500);

      // Lấy HTML content
      const html = await page.content();

      // Dùng AI để parse
      const parsed = await this.aiParser.parseArticle(
        html,
        url,
        this.source.domain,
      );

      if (!parsed) {
        this.logger.warn(`Failed to parse article: ${url}`);
        return null;
      }

      // Tạo external ID từ URL
      const externalId = this.generateExternalId(url);

      return {
        source: this.sourceName,
        externalId,
        title: parsed.title,
        content: parsed.content,
        url,
        publishedAt: parsed.publishedAt || new Date(),
        symbols: parsed.symbols || [],
        author: parsed.author,
        raw: { originalUrl: url },
      };

    } catch (error) {
      this.logger.error(`Error crawling article ${url}: ${error.message}`);
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * Generate unique external ID from URL
   */
  private generateExternalId(url: string): string {
    // Extract path and use as ID (remove domain and query params)
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace(/\//g, '_');
      return `${this.source.domain}${path}`.replace(/[^a-zA-Z0-9_-]/g, '');
    } catch {
      // Fallback: hash the URL
      return Buffer.from(url).toString('base64').slice(0, 50);
    }
  }

  /**
   * Main method: Fetch news từ source này
   */
  async fetchNews(): Promise<CreateNewsDto[]> {
    try {
      this.logger.log(`🚀 Starting crawl from ${this.sourceName}`);

      // Bước 1: Lấy danh sách URLs
      const urls = await this.fetchArticleUrls();
      
      if (urls.length === 0) {
        this.logger.warn(`No articles found from ${this.sourceName}`);
        return [];
      }

      // Bước 2: Crawl từng bài viết
      const articles: CreateNewsDto[] = [];
      
      for (const url of urls) {
        const article = await this.crawlArticle(url);
        if (article) {
          articles.push(article);
        }
        
        // Rate limiting - đợi giữa các requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logger.log(`✅ Crawled ${articles.length}/${urls.length} articles from ${this.sourceName}`);
      return articles;

    } catch (error) {
      this.logger.error(`Error in fetchNews for ${this.sourceName}: ${error.message}`);
      return [];
    }
  }
}
