import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('news_price_impact')
@Index(['symbol', 'timeframe', 'createdAt'])
export class NewsPriceImpact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  newsId: string;

  @Column()
  symbol: string; // BTCUSDT

  @Column()
  timeframe: string; // 15m, 1h, 1d

  // ==========================================
  // GROUP 1: TARGET (LABEL - CÁI CẦN DỰ ĐOÁN)
  // ==========================================
  @Column('float')
  priceBefore: number; // Giá Open nến tại thời điểm tin ra

  @Column('float')
  priceAfter: number; // Giá Close sau timeframe

  @Column('float')
  returnPct: number; // (priceAfter - priceBefore) / priceBefore * 100

  @Column('float', { nullable: true })
  maxDrawdownPct?: number; // % sụt giảm tối đa trong khung giờ (đo rủi ro)

  @Column('float', { nullable: true })
  maxRunupPct?: number; // % tăng tối đa trong khung giờ (đo tiềm năng)

  // ==========================================
  // GROUP 2: MOMENTUM CONTEXT (ĐÀ GIÁ)
  // ==========================================
  
  @Column('float', { nullable: true })
  rsi14?: number; // Chỉ số RSI khung 14 (Range: 0-100)

  @Column('float', { nullable: true })
  macdHistogram?: number; // Để biết đà tăng đang mạnh lên hay yếu đi

  // ==========================================
  // GROUP 3: TREND CONTEXT (XU HƯỚNG)
  // ==========================================

  @Column('float', { nullable: true })
  priceToSma200Ratio?: number; 
  // Cách tính: priceBefore / SMA200. 
  // > 1: Uptrend dài hạn. < 1: Downtrend dài hạn.

  @Column('float', { nullable: true })
  priceToEma50Ratio?: number; // Xu hướng trung hạn

  // ==========================================
  // GROUP 4: VOLATILITY CONTEXT (BIẾN ĐỘNG)
  // ==========================================

  @Column('float', { nullable: true })
  volatilityAtr14?: number; 
  // Average True Range (được chuẩn hóa theo %). 

  @Column('float', { nullable: true })
  bbWidth?: number; 
  // Bollinger Band Width. 

  // ==========================================
  // GROUP 5: LIQUIDITY CONTEXT (THANH KHOẢN)
  // ==========================================

  @Column('float', { nullable: true })
  volumeRatio24h?: number;
  // Volume cây nến hiện tại / Trung bình Volume 24h trước.

  // ==========================================
  // GROUP 6: MARKET CORRELATION (QUAN TRỌNG VỚI CRYPTO)
  // ==========================================

  @Column('float', { nullable: true })
  btcPriceChange24h?: number; // % thay đổi giá BTC trong 24h qua

  @Column('float', { nullable: true })
  btcDominance?: number; // Chỉ số BTC.D

  @CreateDateColumn()
  createdAt: Date;
}
