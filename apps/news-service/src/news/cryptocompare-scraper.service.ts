import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';

interface ScrapedNews {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  body?: string;
  categories?: string;
  sentiment?: string; // Lấy trực tiếp từ website 
}

@Injectable()
export class CryptoCompareScraperService implements OnModuleDestroy {
  private readonly logger = new Logger(CryptoCompareScraperService.name);
  private readonly newsUrl = 'https://www.cryptocompare.com/news/list/latest/';
  private browser: Browser | null = null;

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async scrapeNews(): Promise<ScrapedNews[]> {
    let page: Page | null = null;
    
    try {
      this.logger.log('Launching browser to scrape CryptoCompare website...');
      
      const browser = await this.getBrowser();
      page = await browser.newPage();
      
      // Disable cache to get fresh content
      await page.route('**/*', route => {
        route.continue({
          headers: {
            ...route.request().headers(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        });
      });
      
      // Set user agent using setExtraHTTPHeaders
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      // Navigate to the news page
      await page.goto(this.newsUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      // Force reload to get fresh content
      await page.reload({ waitUntil: 'domcontentloaded' });

      // Wait for JavaScript to render
      await page.waitForTimeout(5000);

      // Extract news data
      const newsItems = await page.evaluate(() => {
        const items: any[] = [];
        const seenUrls = new Set<string>();
        
        // Find all links with meaningful text (potential news titles)
        const allLinks = Array.from(document.querySelectorAll('a'));
        
        // Filter links with title-like text length
        const potentialNewsLinks = allLinks.filter(link => {
          const text = link.textContent?.trim() || '';
          const href = link.getAttribute('href') || '';
          return text.length > 30 && text.length < 300 && href.length > 5;
        });

        potentialNewsLinks.forEach((link, index) => {
          if (index >= 20) return;
          
          try {
            // Extract title and URL from link
            let title = link.textContent?.trim() || '';
            const url = link.getAttribute('href') || '';
            
            // Clean title
            if (title) {
              title = title
                .replace(/^\s*[a-z0-9]{1,6}\s+/, '')
                .replace(/\s+/g, ' ')
                .trim();
            }
            
            // Skip invalid URL patterns
            if (url.includes('javascript:') || url.includes('#') || 
                url.includes('/coins/') || url.includes('/exchanges/')) {
              return;
            }
            
            // Skip if title is too short
            if (!title || title.length < 20 || !url || url.length < 10) {
              return;
            }
            
            // Check duplicate URL
            if (seenUrls.has(url)) {
              return;
            }
            seenUrls.add(url);
            
            // Find parent container for additional info
            let container: Element | null = link.parentElement;
            let depth = 0;
            
            // Go up max 4 levels to find larger container
            while (container && depth < 4) {
              const textLen = container.textContent?.length || 0;
              if (textLen > 200) {
                break;
              }
              container = container.parentElement;
              depth++;
            }
            
            if (!container) {
              container = link.parentElement || link;
            }
            
            const element = container;
            
            // Extract source and time
            const innerHTML = element.innerHTML;
            const allText = element.textContent || '';
            let source = 'CryptoCompare';
            let timeText = '';
            
            // Try to find source from news-source class
            const sourceElement = element.querySelector('.news-source');
            if (sourceElement) {
              const sourceText = sourceElement.textContent?.trim() || '';
              if (sourceText && sourceText.length > 0 && sourceText.length < 50) {
                source = sourceText;
              }
            }
            
            // Try to find time from news-date class
            const timeElement = element.querySelector('.news-date');
            if (timeElement) {
              const timeCandidate = timeElement.textContent?.trim() || '';
              if (timeCandidate && (timeCandidate.includes('ago') || timeCandidate.includes('min') || timeCandidate.includes('hour'))) {
                timeText = timeCandidate;
              }
            }
            
            // Extract time from allText if still not found
            if (!timeText) {
              const timeMatch = allText.match(/(\d+\s+(?:second|sec|minute|min|hour|day|week|month)s?\s+ago)/i);
              if (timeMatch) {
                timeText = timeMatch[1].trim();
              }
            }
            
            // Extract categories
            let categories = '';
            const categoryMatch = allText.match(/Categories:\s*([A-Z][A-Z\s|]*?)(?:\s+Sentiment|$)/i);
            if (categoryMatch) {
              categories = categoryMatch[1]
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/\s+\|/g, '|')
                .replace(/\|\s+/g, '|')
                .replace(/\s+S$/g, '')
                .replace(/\|+$/g, '');
            }
            
            // Extract body/description with multiple fallback methods
            let body = '';
            
            // Method 1: Find paragraphs
            const paragraphs = element.querySelectorAll('p');
            for (const p of Array.from(paragraphs)) {
              const text = p.textContent?.trim() || '';
              if (text.length > 50 && text.length < 1000 && !text.includes('Categories:') && !text.includes('ago')) {
                body = text;
                break;
              }
            }
            
            // Method 2: Find description divs
            if (!body) {
              const descDiv = element.querySelector('[class*="description"], [class*="excerpt"], [class*="summary"], [class*="content"]');
              if (descDiv) {
                const text = descDiv.textContent?.trim() || '';
                if (text.length > 30 && text.length < 1000) {
                  body = text;
                }
              }
            }
            
            // Method 3: Clean all text
            if (!body) {
              let fullText = allText
                .replace(title, '')
                .replace(/Categories:.*$/i, '')
                .replace(/\d+\s+(?:min|hour|day)s?\s+ago/gi, '')
                .replace(source, '')
                .replace(/Sentiment:/gi, '')
                .replace(/POSITIVE|NEGATIVE|NEUTRAL/gi, '')
                .trim()
                .replace(/\s+/g, ' ');
              
              if (fullText.length > 100 && fullText.length < 1000) {
                body = fullText.substring(0, 500).trim();
              }
            }
            
            // Method 4: Scan all divs
            if (!body) {
              const allDivs = element.querySelectorAll('div');
              for (const div of Array.from(allDivs)) {
                const text = div.textContent?.trim() || '';
                if (text.length > 100 && text.length < 800 && 
                    !text.includes('Categories:') && 
                    !text.includes(title) &&
                    !text.includes('ago')) {
                  body = text.substring(0, 500).trim();
                  break;
                }
              }
            }
            
            // Method 5: Last resort
            if (!body && allText.length > 200) {
              let cleanText = allText
                .replace(title, '')
                .replace(source, '')
                .replace(categories, '')
                .replace(/\d+\s+(?:min|hour|day)s?\s+ago/gi, '')
                .replace(/Categories:.*$/i, '')
                .replace(/Sentiment:/gi, '')
                .replace(/POSITIVE|NEGATIVE|NEUTRAL/gi, '')
                .trim()
                .replace(/\s+/g, ' ');
              
              if (cleanText.length > 80) {
                body = cleanText.substring(0, 400).trim();
              }
            }
            
            // Extract sentiment
            let sentiment: string | undefined = undefined;
            if (innerHTML.includes('POSITIVE') || allText.includes('POSITIVE')) {
              sentiment = 'bullish';
            } else if (innerHTML.includes('NEGATIVE') || allText.includes('NEGATIVE')) {
              sentiment = 'bearish';
            } else if (innerHTML.includes('NEUTRAL') || allText.includes('NEUTRAL')) {
              sentiment = 'neutral';
            }
            
            // Add to results
            if (title && title.length > 20 && url && url.length > 10) {
              items.push({
                title,
                url,
                source,
                body,
                categories,
                timeText: timeText || 'NO_TIME',
                sentiment,
              });
            }
          } catch (itemError) {
            // Skip items with errors
          }
        });
        
        return items;
      });

      this.logger.log(`Extracted ${newsItems.length} news items from page`);

      const transformedNews: ScrapedNews[] = newsItems.map((item: any, index: number) => {
        // Generate unique ID from URL hash + index
        const fullUrl = item.url.startsWith('http') ? item.url : `https://www.cryptocompare.com${item.url}`;
        const urlHash = fullUrl.split('').reduce((acc: number, char: string) => {
          return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        
        const uniqueId = `cc_${Math.abs(urlHash).toString(36)}_${index}`;
        const publishedAt = this.parseTimeText(item.timeText);
        
        // Log first 3 items' time parsing
        if (index < 3) {
          this.logger.log(`Item ${index}: timeText="${item.timeText}" => published_at=${publishedAt}`);
        }
        
        return {
          id: uniqueId,
          title: item.title,
          source: item.source,
          url: fullUrl,
          published_at: publishedAt,
          body: item.body,
          categories: item.categories,
          sentiment: item.sentiment,
        };
      });

      // Sort by published_at DESC (newest first) to ensure correct order
      transformedNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

      if (transformedNews.length > 0) {
        this.logger.log(`Successfully scraped ${transformedNews.length} news items`);
        this.logger.log(`First item time: ${transformedNews[0].published_at}, Last item time: ${transformedNews[transformedNews.length - 1].published_at}`);
        return transformedNews;
      }

      this.logger.warn('No news items found from scraping');
      return [];
    } catch (error) {
      this.logger.error(`Error scraping CryptoCompare website: ${error.message}`);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }


  private parseTimeText(timeText: string): string {
    try {
      // Handle common time formats
      const now = new Date();
      
      // Log input
      if (!timeText || timeText.trim() === '') {
        this.logger.warn('Empty timeText, using current time');
        return now.toISOString();
      }
      
      if (timeText.includes('ago')) {
        const match = timeText.match(/(\d+)\s*(second|sec|minute|min|hour|day|week|month)s?\s*ago/i);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          
          const date = new Date(now);
          // Normalize units
          if (unit.startsWith('sec')) {
            date.setSeconds(date.getSeconds() - value);
          } else if (unit.startsWith('min')) {
            date.setMinutes(date.getMinutes() - value);
          } else if (unit.startsWith('hour')) {
            date.setHours(date.getHours() - value);
          } else if (unit.startsWith('day')) {
            date.setDate(date.getDate() - value);
          } else if (unit.startsWith('week')) {
            date.setDate(date.getDate() - (value * 7));
          } else if (unit.startsWith('month')) {
            date.setMonth(date.getMonth() - value);
          }
          return date.toISOString();
        } else {
          this.logger.warn(`Failed to parse time with 'ago': ${timeText}`);
        }
      }
      
      // Try parse directly
      const parsed = Date.parse(timeText);
      if (!isNaN(parsed)) {
        return new Date(parsed).toISOString();
      }
      
      // Default to current time
      this.logger.warn(`Unable to parse timeText, using current time: "${timeText}"`);
      return now.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}
