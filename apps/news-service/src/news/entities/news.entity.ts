import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('news')
export class NewsEntity {
  @PrimaryColumn()
  id: string;

  @Column('text')
  title: string;

  @Column()
  source: string;

  @Column()
  url: string;

  @Column({ type: 'datetime' })
  @Index()
  published_at: Date;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  sentiment_label: 'positive' | 'negative' | 'neutral';

  @Column({ type: 'float', default: 0 })
  sentiment_score: number;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ type: 'text', nullable: true })
  categories?: string;

  @Column({ type: 'float', nullable: true })
  btc_price?: number;

  @Column({ type: 'float', nullable: true })
  eth_price?: number;

  @Column({ type: 'json', nullable: true })
  coin_prices?: Record<string, number>;

  @Column({ type: 'varchar', length: 50 })
  api_source: string; // 'cryptopanic' | 'cryptocompare'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
