import { Injectable, Logger } from '@nestjs/common';

interface QueueItem<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

/**
 * Request queue để xử lý requests tuần tự
 * Tránh vượt quá rate limit của API
 */
@Injectable()
export class RequestQueueService {
  private readonly logger = new Logger(RequestQueueService.name);
  private queue: QueueItem<any>[] = [];
  private isProcessing = false;
  private concurrency: number; // Số requests xử lý đồng thời
  private activeCount = 0;

  constructor(concurrency = 1) {
    this.concurrency = concurrency;
  }

  /**
   * Thêm request vào queue
   */
  async add<T>(fn: () => Promise<T>, id?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id: id || Math.random().toString(),
        fn,
        resolve,
        reject,
      });

      this.logger.debug(
        `📝 Added to queue. Queue size: ${this.queue.length}, Active: ${this.activeCount}`,
      );
      this.process();
    });
  }

  /**
   * Xử lý queue
   */
  private async process(): Promise<void> {
    if (this.isProcessing || this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeCount < this.concurrency) {
      const item = this.queue.shift();
      if (!item) break;

      this.activeCount++;

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      } finally {
        this.activeCount--;

        // Add delay giữa requests để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 200));

        this.logger.debug(
          `✅ Request completed. Queue size: ${this.queue.length}, Active: ${this.activeCount}`,
        );
      }
    }

    this.isProcessing = false;

    // Tiếp tục xử lý nếu còn items
    if (this.queue.length > 0) {
      this.process();
    }
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueSize: this.queue.length,
      activeCount: this.activeCount,
      concurrency: this.concurrency,
    };
  }

  /**
   * Thay đổi concurrency
   */
  setConcurrency(concurrency: number): void {
    this.concurrency = Math.max(1, concurrency);
    this.logger.log(`🔄 Concurrency set to ${this.concurrency}`);
    this.process();
  }
}
