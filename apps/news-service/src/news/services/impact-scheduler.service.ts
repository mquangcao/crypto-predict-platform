import { Injectable, Logger, Inject } from '@nestjs/common';
import { getConfig } from '@app/common';
import { 
  SchedulerClient, 
  CreateScheduleCommand, 
  ActionAfterCompletion 
} from '@aws-sdk/client-scheduler';
import { AWS_SCHEDULER_CLIENT } from '../providers/aws-clients.provider';
import { filterValidSymbols } from '../utils/symbol-mapper';

@Injectable()
export class ImpactSchedulerService {
  private readonly logger = new Logger(ImpactSchedulerService.name);
  private readonly targetSqsArn: string;
  private readonly roleArn: string;

  constructor(
    @Inject(AWS_SCHEDULER_CLIENT)
    private readonly schedulerClient: SchedulerClient,
  ) {
    this.targetSqsArn = getConfig('aws.sqs.impactQueueArn');
    this.roleArn = getConfig('aws.eventBridge.roleArn');
  }

  // Hàm này sẽ được gọi 1 lần, nó tự sinh ra 3 lịch hẹn cho mỗi symbol
  async scheduleAllTimeframes(
    articleId: string, 
    symbols: string[], 
    publishedAt: Date
  ) {
    const now = new Date().getTime();
    
    // Tạo 3 mốc thời gian: 15 phút, 1 giờ, 1 ngày
    const schedules = [
      { frame: '15m', date: new Date(now + 15 * 60 * 1000) },
      { frame: '1h',  date: new Date(now + 60 * 60 * 1000) },
      { frame: '1d',  date: new Date(now + 24 * 60 * 60 * 1000) },
    ];

    // Validate và filter symbols - chỉ giữ lại symbols hợp lệ
    let symbolsToAnalyze = filterValidSymbols(symbols);
    
    // Nếu không có valid symbols, dùng default
    if (symbolsToAnalyze.length === 0) {
      symbolsToAnalyze = ['BTCUSDT'];
      this.logger.warn(
        `No valid symbols for article ${articleId.substring(0, 8)}, using default: BTCUSDT`
      );
    }
    
    // Limit to 3 symbols max để tránh quá nhiều analyses
    symbolsToAnalyze = symbolsToAnalyze.slice(0, 3);

    // Tạo schedule cho mỗi symbol x timeframe
    for (const symbol of symbolsToAnalyze) {
      for (const item of schedules) {
        await this.createSchedule(
          articleId, 
          symbol, 
          publishedAt.toISOString(), 
          item.frame, 
          item.date
        );
      }
    }
  }

  private async createSchedule(
    articleId: string,
    symbol: string,
    publishedAt: string,
    timeframe: string, 
    date: Date
  ) {
    // AWS Schedule name must be <= 64 chars
    // Format: imp_{shortId}_{symbol}_{tf}_{shortTs}
    const shortId = articleId.substring(0, 8); // First 8 chars of UUID
    const shortSymbol = symbol.substring(0, 12); // Max 12 chars for symbol
    const shortTs = (date.getTime() % 1000000000).toString(); // Last 9-10 digits
    
    const scheduleName = `imp_${shortId}_${shortSymbol}_${timeframe}_${shortTs}`
      .replace(/[^a-zA-Z0-9-_]/g, '_'); // Remove invalid characters
    
    // Verify length (should be ~30-40 chars, well under 64 limit)
    if (scheduleName.length > 64) {
      this.logger.error(`Schedule name too long (${scheduleName.length}): ${scheduleName}`);
      return;
    }

    const command = new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: `at(${date.toISOString().split('.')[0]})`, // Định dạng: at(yyyy-MM-ddThh:mm:ss)
      ScheduleExpressionTimezone: 'UTC',
      FlexibleTimeWindow: { Mode: 'OFF' },
      Target: {
        Arn: this.targetSqsArn, // Gửi tới SQS
        RoleArn: this.roleArn,  // Dùng Role đã tạo để có quyền gửi
        Input: JSON.stringify({ // ✅ Format đúng với ImpactQueueMessage interface
          newsId: articleId,
          symbol: symbol,
          publishedAt: publishedAt,
          timeframe: timeframe,
        }),
      },
      ActionAfterCompletion: ActionAfterCompletion.DELETE, // Tự xóa lịch sau khi chạy xong
    });

    try {
      await this.schedulerClient.send(command);
      this.logger.log(
        `✅ Scheduled: ${symbol} ${timeframe} for article ${articleId.substring(0, 8)}... ` +
        `at ${date.toISOString()} (name: ${scheduleName})`
      );
    } catch (error) {
      this.logger.error(`Failed to schedule ${symbol} ${timeframe}`, error);
    }
  }
}
