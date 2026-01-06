import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('news_article')
@Index(['source', 'externalId'], { unique: true }) // Quan trọng: Chống trùng lặp
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column('simple-array', { nullable: true })
  symbols: string[]; // BTC, ETH...

  @Column({ nullable: true })
  author?: string;

  @Column({ type: 'jsonb', nullable: true })
  raw?: any;

  @CreateDateColumn()
  createdAt: Date;
}