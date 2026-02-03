import { BaseEntity } from '@app/common';
import { Entity, Column, Index } from 'typeorm';

/**
 * Lưu trữ các HTML parsing patterns đã học được từ AI
 * Giúp giảm chi phí và tăng tốc độ crawl bằng cách tái sử dụng patterns
 */
@Entity('html_pattern')
@Index(['sourceDomain', 'successCount'])
export class HtmlPattern extends BaseEntity {
  @Column()
  @Index()
  sourceDomain: string; // coindesk.com, cointelegraph.com...

  @Column()
  exampleUrl: string; // URL mẫu đã dùng để học pattern

  @Column({ type: 'jsonb' })
  pattern: {
    titleSelector?: string;
    contentSelector?: string;
    authorSelector?: string;
    dateSelector?: string;
    dateFormat?: string;
  };

  @Column({ type: 'text', nullable: true })
  exampleHtml?: string; // Lưu một phần HTML mẫu để tham khảo

  @Column({ type: 'int', default: 0 })
  successCount: number; // Số lần dùng thành công

  @Column({ type: 'int', default: 0 })
  failureCount: number; // Số lần thất bại (có thể HTML đã thay đổi)

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt?: Date; // Lần cuối sử dụng pattern này

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    notes?: string;
    version?: string;
  };
}
