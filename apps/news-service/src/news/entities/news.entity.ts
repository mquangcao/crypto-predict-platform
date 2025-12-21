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

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ type: 'text', nullable: true })
  categories?: string;

  @Column({ type: 'varchar', length: 50 })
  api_source: string; // 'cryptopanic' | 'cryptocompare'

  @Column({ type: 'text', nullable: true })
  sentiment_from_source?: string; // Sentiment label từ nguồn (nếu có)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
