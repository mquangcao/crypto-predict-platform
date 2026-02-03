import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getConfig } from '@app/common';
import { TrainingDataExportService } from './training-data-export.service';
import { S3UploadService } from './s3-upload.service';

@Injectable()
export class TrainingDataSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(TrainingDataSchedulerService.name);
  private readonly enabled: boolean;

  constructor(
    private readonly exportService: TrainingDataExportService,
    private readonly s3Service: S3UploadService,
  ) {
    this.enabled = getConfig('training.uploadEnabled');
  }

  async onModuleInit() {
    if (this.enabled) {
      this.logger.log('🚀 Training data scheduler enabled');
    } else {
      this.logger.log('⏸️ Training data scheduler disabled (set training.uploadEnabled=true to enable)');
    }
  }

  /**
   * Upload training data daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'upload-training-data',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async uploadDailyTrainingData() {
    if (!this.enabled) return;

    try {
      this.logger.log('📤 Starting daily training data upload...');

      // Export data from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.exportAndUpload(yesterday, today, 'daily');

      this.logger.log('✅ Daily training data upload completed');
    } catch (error) {
      this.logger.error('❌ Failed to upload daily training data:', error.stack);
    }
  }

  /**
   * Upload full training data weekly on Sunday at 3 AM
   */
  @Cron(CronExpression.EVERY_WEEK, {
    name: 'upload-full-training-data',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async uploadWeeklyFullData() {
    if (!this.enabled) return;

    try {
      this.logger.log('📤 Starting weekly full training data upload...');

      // Export all data
      await this.exportAndUpload(undefined, undefined, 'full');

      this.logger.log('✅ Weekly full training data upload completed');
    } catch (error) {
      this.logger.error('❌ Failed to upload weekly training data:', error.stack);
    }
  }

  /**
   * Manual trigger for uploading training data
   */
  async uploadTrainingDataNow(startDate?: Date, endDate?: Date): Promise<string | null> {
    this.logger.log('📤 Manual training data upload triggered');
    return this.exportAndUpload(startDate, endDate, 'manual');
  }

  /**
   * Export and upload to S3
   */
  private async exportAndUpload(
    startDate?: Date,
    endDate?: Date,
    type: 'daily' | 'full' | 'manual' = 'manual',
  ): Promise<string | null> {
    // 1. Export data
    const data = await this.exportService.exportTrainingData(startDate, endDate);

    if (data.length === 0) {
      this.logger.warn('⚠️ No training data to upload');
      return null;
    }

    // 2. Convert to CSV
    const csv = this.exportService.convertToCSV(data);

    // 3. Generate filename
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `training-data-${type}-${timestamp}.csv`;

    // 4. Upload to S3
    const s3Uri = await this.s3Service.uploadCSV(fileName, csv);

    // 5. Also upload stats as JSON
    const stats = await this.exportService.getDatasetStats();
    const statsFileName = `stats-${type}-${timestamp}.json`;
    await this.s3Service.uploadJSON(statsFileName, {
      ...stats,
      exportedAt: new Date().toISOString(),
      dataRows: data.length,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });

    this.logger.log(
      `📊 Uploaded ${data.length} rows to ${s3Uri}\n` +
      `   Symbols: ${Object.keys(stats.symbolDistribution).length}\n` +
      `   Date range: ${stats.dateRange?.min} to ${stats.dateRange?.max}`
    );

    return s3Uri;
  }
}
