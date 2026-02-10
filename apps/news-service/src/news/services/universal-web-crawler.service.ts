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
      
      // Sử dụng load thay vì networkidle để tránh timeout
      // Load = page load xong, không chờ tất cả background requests
      await page.goto(this.source.newsListUrl, {
        waitUntil: 'load',
        timeout: 20000,
      });

      // Đợi content load
      if (this.source.waitForSelector) {
        try {
          await page.waitForSelector(this.source.waitForSelector, { timeout: 5000 });
        } catch (e) {
          this.logger.warn(`Selector timeout for ${this.source.waitForSelector}, continuing anyway`);
        }
      } else {
        await page.waitForTimeout(1500); // Short wait for JS to render
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

      // Filter out category/list pages - keep only individual articles
      const articleLinks = links.filter(url => this.isArticlePage(url));

      // Loại bỏ duplicates và giới hạn số lượng
      const uniqueLinks = Array.from(new Set(articleLinks));
      const maxArticles = this.source.maxArticles || 10;
      const limitedLinks = uniqueLinks.slice(0, maxArticles);

      this.logger.log(`🔗 Found ${limitedLinks.length} article URLs (filtered from ${links.length})`);
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
   * Filter category/list pages - keep only individual articles
   * Article URLs typically have multiple path segments or date patterns
   * Category URLs are single words like /news/business, /news/defi
   */
  private isArticlePage(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      // Exclude common category/list page patterns
      const excludePatterns = [
        '/news$', // Just /news
        '/categories', 
        'editors-picks',
        'trending',
        'latest',
        'all',
        'archive',
        '/tags/',
        '/author/',
      ];

      for (const pattern of excludePatterns) {
        if (new RegExp(pattern, 'i').test(path)) {
          return false;
        }
      }

      // Extract last segment
      const segments = path.split('/').filter(s => s.length > 0);
      if (segments.length < 2) return false; // Must have at least /news/something

      const lastSegment = segments[segments.length - 1];

      // Article pages typically have dashes, dates, or numbers in the title
      // Examples: "bitcoin-hits-new-high", "2024-02-10-news"
      const hasArticlePattern = /[-\d]/.test(lastSegment);

      return hasArticlePattern;
    } catch (error) {
      return true; // Default to true if error
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
