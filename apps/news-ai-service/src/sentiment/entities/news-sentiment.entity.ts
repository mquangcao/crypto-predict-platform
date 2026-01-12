import { BaseEntity } from '@app/common';
import { Entity, Column, Index } from 'typeorm';

@Entity('news_sentiment')
@Index(['newsId'], { unique: true })
export class NewsSentiment extends BaseEntity {
  @Column()
  newsId: string;

  @Column()
  model: string; // e.g. vader, bert, gpt

  @Index()
  @Column('float')
  sentimentScore: number; // -1 → +1

  @Column({
    type: 'enum',
    enum: ['positive', 'neutral', 'negative'],
  })
  sentimentLabel: 'positive' | 'neutral' | 'negative';

  @Column('float', { nullable: true })
  confidence?: number;
}
