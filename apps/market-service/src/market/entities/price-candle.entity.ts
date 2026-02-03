import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity({ name: 'price_candles' })
@Index(['symbol', 'timestamp'])
export class PriceCandle {
  @PrimaryColumn({ type: 'timestamptz' })
  timestamp: Date;

  @PrimaryColumn({ type: 'text' })
  symbol: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  open: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  high: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  low: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  close: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  volume: number;
}
