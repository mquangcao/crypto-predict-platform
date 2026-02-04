import { Controller, Post, Get, Query, Logger } from '@nestjs/common';
import { TrainingDataSchedulerService } from '../services/training-data-scheduler.service';
import { TrainingDataExportService } from '../services/training-data-export.service';

@Controller('training')
export class TrainingController {
  private readonly logger = new Logger(TrainingController.name);

  constructor(
    private readonly schedulerService: TrainingDataSchedulerService,
    private readonly exportService: TrainingDataExportService,
  ) {}

  /**
   * Manually trigger training data upload to S3
   * 
   * @example
   * POST /training/upload
   * POST /training/upload?startDate=2026-01-01&endDate=2026-01-28
   */
  @Post('upload')
  async uploadTrainingData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log('📤 Manual upload triggered via API');

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    try {
      const s3Uri = await this.schedulerService.uploadTrainingDataNow(start, end);

      if (!s3Uri) {
        return {
          success: false,
          message: 'No training data available to upload',
        };
      }

      return {
        success: true,
        message: 'Training data uploaded successfully',
        s3Uri,
        startDate: start?.toISOString(),
        endDate: end?.toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to upload training data:', error.stack);
      return {
        success: false,
        message: `Upload failed: ${error.message}`,
      };
    }
  }

  /**
   * Get dataset statistics
   * 
   * @example
   * GET /training/stats
   */
  @Get('stats')
  async getDatasetStats() {
    try {
      const stats = await this.exportService.getDatasetStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error('Failed to get dataset stats:', error.stack);
      return {
        success: false,
        message: `Failed to get stats: ${error.message}`,
      };
    }
  }

  /**
   * Preview training data (first 100 rows)
   * 
   * @example
   * GET /training/preview
   * GET /training/preview?limit=50
   */
  @Get('preview')
  async previewData(@Query('limit') limit?: string) {
    try {
      const maxRows = limit ? parseInt(limit, 10) : 100;
      const data = await this.exportService.exportTrainingData();
      
      return {
        success: true,
        totalRows: data.length,
        preview: data.slice(0, maxRows),
        message: `Showing first ${Math.min(maxRows, data.length)} of ${data.length} rows`,
      };
    } catch (error) {
      this.logger.error('Failed to preview data:', error.stack);
      return {
        success: false,
        message: `Failed to preview: ${error.message}`,
      };
    }
  }
}
