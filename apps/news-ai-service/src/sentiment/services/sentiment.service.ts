import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Sentiment from 'sentiment';
import { getConfig } from '@app/common';
import { NewsSentiment } from '../entities/news-sentiment.entity';
import { SentimentResult } from '../interfaces/sentiment.interface';

@Injectable()
export class SentimentService {
  private readonly logger = new Logger(SentimentService.name);
  private readonly sentimentAnalyzer: Sentiment;
  private readonly model: string;

  constructor(
    @InjectRepository(NewsSentiment)
    private readonly sentimentRepo: Repository<NewsSentiment>,
  ) {
    this.sentimentAnalyzer = new Sentiment();
    this.model = getConfig('sentiment.model') || 'vader';
  }

  /**
   * Analyze sentiment and save to database
   */
  async analyzeAndSave(articleId: string, title: string, content: string): Promise<NewsSentiment> {
    // Check if already analyzed
    const existing = await this.sentimentRepo.findOne({
      where: { newsId: articleId },
    });

    if (existing) {
      this.logger.log(`Article ${articleId} already analyzed, skipping`);
      return existing;
    }

    // Analyze sentiment
    const sentimentResult = this.analyze(title + ' ' + content);

    // Save to database
    const newSentiment = this.sentimentRepo.create({
      newsId: articleId,
      model: this.model,
      sentimentScore: sentimentResult.score,
      sentimentLabel: sentimentResult.label,
      confidence: sentimentResult.confidence,
    });

    const saved = await this.sentimentRepo.save(newSentiment);
    
    this.logger.log(
      `✅ Saved sentiment for article ${articleId}: ${sentimentResult.label} (${sentimentResult.score.toFixed(2)})`
    );

    return saved;
  }

  /**
   * Analyze text using Sentiment library (VADER-based)
   */
  private analyze(text: string): SentimentResult {
    const result = this.sentimentAnalyzer.analyze(text);
    
    // Normalize score to -1 to +1 range
    // VADER comparative score is already normalized but can be enhanced
    const normalizedScore = this.normalizeScore(result.comparative);
    
    // Determine label based on score
    let label: 'positive' | 'neutral' | 'negative';
    if (normalizedScore > 0.05) {
      label = 'positive';
    } else if (normalizedScore < -0.05) {
      label = 'negative';
    } else {
      label = 'neutral';
    }

    // Calculate confidence based on absolute score
    const confidence = Math.min(Math.abs(normalizedScore) * 2, 1);

    return {
      score: normalizedScore,
      label,
      confidence,
    };
  }

  /**
   * Normalize VADER comparative score to -1 to +1 range
   */
  private normalizeScore(comparative: number): number {
    // VADER comparative is already somewhat normalized, but we can clamp it
    return Math.max(-1, Math.min(1, comparative));
  }

  /**
   * Get sentiment by article ID
   */
  async findByArticleId(articleId: string): Promise<NewsSentiment | null> {
    return this.sentimentRepo.findOne({
      where: { newsId: articleId },
    });
  }

  /**
   * Get all sentiments
   */
  async findAll(limit: number = 100): Promise<NewsSentiment[]> {
    return this.sentimentRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get sentiments by label
   */
  async findByLabel(
    label: 'positive' | 'neutral' | 'negative',
    limit: number = 100
  ): Promise<NewsSentiment[]> {
    return this.sentimentRepo.find({
      where: { sentimentLabel: label },
      order: { sentimentScore: 'DESC' },
      take: limit,
    });
  }
}
