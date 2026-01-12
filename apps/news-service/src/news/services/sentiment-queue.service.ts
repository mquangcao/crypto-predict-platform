import { Injectable, Logger, Inject } from '@nestjs/common';
import { getConfig } from '@app/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { AWS_SQS_CLIENT } from '../providers/aws-clients.provider';

@Injectable()
export class SentimentQueueService {
  private readonly logger = new Logger(SentimentQueueService.name);
  private readonly queueUrl: string;

  constructor(
    @Inject(AWS_SQS_CLIENT)
    private readonly sqsClient: SQSClient,
  ) {
    this.queueUrl = getConfig('aws.sqs.sentimentQueueUrl');
  }

  async sendNewsForAnalysis(articleId: string, title: string, content: string) {
    if (!this.queueUrl) {
      this.logger.warn('Sentiment Queue URL not configured, skipping sentiment analysis');
      return;
    }

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify({
        articleId,
        title,
        content,
        task: 'ANALYZE_SENTIMENT',
        timestamp: new Date().toISOString(),
      }),
      MessageAttributes: {
        taskType: {
          DataType: 'String',
          StringValue: 'ANALYZE_SENTIMENT',
        },
        articleId: {
          DataType: 'String',
          StringValue: articleId,
        },
      },
    });

    try {
      const response = await this.sqsClient.send(command);
      this.logger.log(`✅ Sent to sentiment queue: article ${articleId} (MessageId: ${response.MessageId})`);
    } catch (error) {
      this.logger.error(`Failed to send article ${articleId} to sentiment queue`, error);
    }
  }
}
