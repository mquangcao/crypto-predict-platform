import { BaseEntity } from '@app/common';
import { Entity, Column, Index } from 'typeorm';

@Entity('news_article')
@Index(['source', 'externalId'], { unique: true })
export class NewsArticle extends BaseEntity {
  @Column()
  source: string; // cryptocompare, coindesk...

  @Column()
  externalId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  url: string;

  @Column({ type: 'timestamptz' })
  publishedAt: Date;

  @Column('text', { array: true, nullable: true })
  symbols: string[]; // BTC, ETH...

  @Column({ nullable: true })
  author?: string;

  @Column({ type: 'jsonb', nullable: true })
  raw?: any;
}