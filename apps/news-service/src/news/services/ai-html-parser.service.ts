import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HtmlPattern } from '../entities/html-pattern.entity';
import * as cheerio from 'cheerio';

interface ParsedArticle {
  title: string;
  content: string;
  author?: string;
  publishedAt?: Date;
  symbols?: string[];
}

interface ExtractionPattern {
  titleSelector?: string;
  contentSelector?: string;
  authorSelector?: string;
  dateSelector?: string;
  dateFormat?: string;
}

@Injectable()
export class AiHtmlParserService {
  private readonly logger = new Logger(AiHtmlParserService.name);
  private openaiApiKey: string;

  constructor(
    @InjectRepository(HtmlPattern)
    private readonly patternRepo: Repository<HtmlPattern>,
  ) {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Phân tích HTML và trích xuất thông tin bài viết
   * Tự động học và lưu pattern để tái sử dụng
   */
  async parseArticle(
    html: string,
    url: string,
    sourceDomain: string,
  ): Promise<ParsedArticle | null> {
    try {
      // Bước 1: Kiểm tra xem đã có pattern đã học cho domain này chưa
      const existingPattern = await this.findLatestWorkingPattern(sourceDomain);

      if (existingPattern) {
        this.logger.log(`📋 Using cached pattern for ${sourceDomain}`);
        const result = this.extractWithPattern(html, existingPattern.pattern);
        
        // Nếu pattern cũ vẫn work (có title và content) => dùng luôn
        if (result && result.title && result.content) {
          await this.updatePatternSuccess(existingPattern.id);
          return result;
        }
        
        this.logger.warn(`⚠️ Cached pattern failed for ${sourceDomain}, falling back to AI`);
        await this.markPatternAsFailed(existingPattern.id);
      }

      // Bước 2: Dùng AI để học pattern mới
      this.logger.log(`🤖 Using AI to learn new pattern for ${sourceDomain}`);
      const aiResult = await this.extractWithAI(html, url);

      if (!aiResult) {
        return null;
      }

      // Bước 3: Lưu pattern mới vào database
      await this.savePattern(sourceDomain, url, aiResult.pattern, html);

      return aiResult.data;
    } catch (error) {
      this.logger.error(`Error parsing article from ${url}: ${error.message}`);
      return null;
    }
  }

  /**
   * Sử dụng AI (OpenAI GPT-4) để phân tích HTML và trích xuất dữ liệu
   */
  private async extractWithAI(
    html: string,
    url: string,
  ): Promise<{ data: ParsedArticle; pattern: ExtractionPattern } | null> {
    if (!this.openaiApiKey) {
      this.logger.error('OpenAI API key not configured');
      return null;
    }

    try {
      // Giảm kích thước HTML để tiết kiệm tokens
      const $ = cheerio.load(html);
      
      // Loại bỏ scripts, styles, comments
      $('script, style, noscript, iframe, svg').remove();
      const cleanHtml = $.html();
      
      // Giới hạn độ dài HTML
      const truncatedHtml = cleanHtml.slice(0, 50000); // ~12k tokens

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cost-effective model
          messages: [
            {
              role: 'system',
              content: `You are an expert web scraper. Analyze the HTML structure and extract news article information.
              
Return a JSON object with two parts:
1. "data": The extracted article data
2. "pattern": CSS selectors that can be used to extract similar articles from this website

Example response:
{
  "data": {
    "title": "Bitcoin Reaches New High",
    "content": "Full article content here...",
    "author": "John Doe",
    "publishedAt": "2026-02-03T10:00:00Z",
    "symbols": ["BTC", "ETH"]
  },
  "pattern": {
    "titleSelector": "h1.article-title",
    "contentSelector": "div.article-body",
    "authorSelector": "span.author-name",
    "dateSelector": "time.publish-date",
    "dateFormat": "iso8601"
  }
}

Rules:
- Extract cryptocurrency symbols mentioned (BTC, ETH, etc.)
- publishedAt should be ISO 8601 format
- Patterns should use specific, reliable CSS selectors
- Content should be the main article text, cleaned of ads/navigation
- Return ONLY valid JSON, no markdown formatting`,
            },
            {
              role: 'user',
              content: `Extract article data and pattern from this HTML:\n\nURL: ${url}\n\nHTML:\n${truncatedHtml}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`OpenAI API error: ${error}`);
        return null;
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        return null;
      }

      // Parse JSON response
      const parsed = JSON.parse(content.trim());
      
      return {
        data: {
          title: parsed.data.title,
          content: parsed.data.content,
          author: parsed.data.author,
          publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : undefined,
          symbols: parsed.data.symbols || [],
        },
        pattern: parsed.pattern,
      };
    } catch (error) {
      this.logger.error(`AI extraction failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Trích xuất dữ liệu sử dụng pattern đã học
   */
  private extractWithPattern(
    html: string,
    pattern: ExtractionPattern,
  ): ParsedArticle | null {
    try {
      const $ = cheerio.load(html);

      const title = pattern.titleSelector ? $(pattern.titleSelector).first().text().trim() : '';
      const content = pattern.contentSelector
        ? $(pattern.contentSelector)
            .map((_, el) => $(el).text())
            .get()
            .join('\n\n')
            .trim()
        : '';
      const author = pattern.authorSelector ? $(pattern.authorSelector).first().text().trim() : undefined;

      let publishedAt: Date | undefined;
      if (pattern.dateSelector) {
        const dateText = $(pattern.dateSelector).first().attr('datetime') || 
                        $(pattern.dateSelector).first().text().trim();
        publishedAt = dateText ? new Date(dateText) : undefined;
      }

      // Extract crypto symbols from title and content
      const text = `${title} ${content}`;
      const symbols = this.extractSymbols(text);

      if (!title || !content) {
        return null;
      }

      return {
        title,
        content,
        author,
        publishedAt,
        symbols,
      };
    } catch (error) {
      this.logger.error(`Pattern extraction failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Trích xuất crypto symbols từ text
   */
  private extractSymbols(text: string): string[] {
    const commonSymbols = [
      'BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC',
      'SHIB', 'AVAX', 'LINK', 'UNI', 'LTC', 'ATOM', 'ETC', 'XLM', 'ALGO', 'VET',
    ];

    const found = new Set<string>();
    const upperText = text.toUpperCase();

    for (const symbol of commonSymbols) {
      // Check for symbol as whole word
      const regex = new RegExp(`\\b${symbol}\\b`, 'gi');
      if (regex.test(upperText)) {
        found.add(symbol);
      }
    }

    return Array.from(found);
  }

  /**
   * Lưu pattern mới vào database
   */
  private async savePattern(
    sourceDomain: string,
    exampleUrl: string,
    pattern: ExtractionPattern,
    exampleHtml: string,
  ): Promise<void> {
    try {
      const htmlPattern = this.patternRepo.create({
        sourceDomain,
        exampleUrl,
        pattern,
        exampleHtml: exampleHtml.slice(0, 10000), // Store sample for reference
        successCount: 1,
        failureCount: 0,
        lastUsedAt: new Date(),
      });

      await this.patternRepo.save(htmlPattern);
      this.logger.log(`✅ Saved new pattern for ${sourceDomain}`);
    } catch (error) {
      this.logger.error(`Failed to save pattern: ${error.message}`);
    }
  }

  /**
   * Tìm pattern hoạt động tốt nhất cho domain
   */
  private async findLatestWorkingPattern(sourceDomain: string): Promise<HtmlPattern | null> {
    return this.patternRepo.findOne({
      where: { sourceDomain },
      order: { 
        successCount: 'DESC', 
        lastUsedAt: 'DESC' 
      },
    });
  }

  /**
   * Cập nhật thành công của pattern
   */
  private async updatePatternSuccess(patternId: string): Promise<void> {
    await this.patternRepo.increment({ id: patternId }, 'successCount', 1);
    await this.patternRepo.update({ id: patternId }, { lastUsedAt: new Date() });
  }

  /**
   * Đánh dấu pattern thất bại
   */
  private async markPatternAsFailed(patternId: string): Promise<void> {
    await this.patternRepo.increment({ id: patternId }, 'failureCount', 1);
    await this.patternRepo.update({ id: patternId }, { lastUsedAt: new Date() });
  }
}
