import { Injectable, Logger, Inject } from '@nestjs/common';
import { getConfig } from '@app/common';
import { 
  SchedulerClient, 
  CreateScheduleCommand, 
  ActionAfterCompletion 
} from '@aws-sdk/client-scheduler';
import { AWS_SCHEDULER_CLIENT } from '../providers/aws-clients.provider';

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

  // Hàm này sẽ được gọi 1 lần, nó tự sinh ra 3 lịch hẹn
  async scheduleAllTimeframes(articleId: string) {
    const now = new Date().getTime();
    
    // Tạo 3 mốc thời gian: 15 phút, 1 giờ, 1 ngày
    const schedules = [
      { frame: '15m', date: new Date(now + 15 * 60 * 1000) },
      { frame: '1h',  date: new Date(now + 60 * 60 * 1000) },
      { frame: '1d',  date: new Date(now + 24 * 60 * 60 * 1000) },
    ];

    for (const item of schedules) {
      await this.createSchedule(articleId, item.frame, item.date);
    }
  }

  private async createSchedule(articleId: string, timeframe: string, date: Date) {
    // Tên Schedule phải Unique và không chứa ký tự lạ
    const scheduleName = `impact_${articleId}_${timeframe}_${date.getTime()}`;

    const command = new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: `at(${date.toISOString().split('.')[0]})`, // Định dạng: at(yyyy-MM-ddThh:mm:ss)
      ScheduleExpressionTimezone: 'UTC',
      FlexibleTimeWindow: { Mode: 'OFF' },
      Target: {
        Arn: this.targetSqsArn, // Gửi tới SQS
        RoleArn: this.roleArn,  // Dùng Role đã tạo để có quyền gửi
        Input: JSON.stringify({ // Nội dung tin nhắn sẽ gửi vào SQS
          articleId,
          timeframe,
          task: 'CALCULATE_IMPACT'
        }),
      },
      ActionAfterCompletion: ActionAfterCompletion.DELETE, // Tự xóa lịch sau khi chạy xong
    });

    try {
      await this.schedulerClient.send(command);
      this.logger.log(`✅ Scheduled: ${timeframe} for article ${articleId} at ${date.toISOString()}`);
    } catch (error) {
      this.logger.error(`Failed to schedule ${timeframe}`, error);
    }
  }
}
