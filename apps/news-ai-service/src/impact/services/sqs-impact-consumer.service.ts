import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { getConfig } from '@app/common';
import { 
  SQSClient, 
  ReceiveMessageCommand, 
  DeleteMessageCommand,
  Message 
} from '@aws-sdk/client-sqs';
import { AWS_SQS_CLIENT } from '../providers/aws-sqs-client.provider';
import { ImpactQueueMessage } from '../interfaces/impact.interface';
import { ImpactAnalysisService } from './impact-analysis.service';

@Injectable()
export class SqsImpactConsumerService implements OnModuleInit {
  private readonly logger = new Logger(SqsImpactConsumerService.name);
  private readonly queueUrl: string;
  private readonly maxMessages: number;
  private readonly waitTimeSeconds: number;
  private readonly visibilityTimeout: number;
  private isPolling = false;

  constructor(
    @Inject(AWS_SQS_CLIENT)
    private readonly sqsClient: SQSClient,
    private readonly impactAnalysisService: ImpactAnalysisService,
  ) {
    this.queueUrl = getConfig('aws.sqs.impactQueueUrl');
    this.maxMessages = getConfig('aws.sqs.maxMessages') || 10;
    this.waitTimeSeconds = getConfig('aws.sqs.waitTimeSeconds') || 20;
    this.visibilityTimeout = getConfig('aws.sqs.visibilityTimeout') || 30;
  }

  onModuleInit() {
    if (!this.queueUrl) {
      this.logger.warn('⚠️ Impact Queue URL not configured, consumer will not start');
      return;
    }
    
    this.logger.log('🚀 Starting Impact SQS consumer...');
    this.startPolling();
  }

  private async startPolling() {
    this.isPolling = true;
    
    while (this.isPolling) {
      try {
        await this.pollMessages();
      } catch (error) {
        this.logger.error('Error in impact polling loop', error);
        await this.sleep(5000);
      }
    }
  }

  private async pollMessages() {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: this.maxMessages,
      WaitTimeSeconds: this.waitTimeSeconds,
      VisibilityTimeout: this.visibilityTimeout,
      MessageAttributeNames: ['All'],
    });

    const response = await this.sqsClient.send(command);

    if (!response.Messages || response.Messages.length === 0) {
      return;
    }

    this.logger.log(`📬 Received ${response.Messages.length} impact messages`);

    for (const message of response.Messages) {
      await this.processMessage(message);
    }
  }

  private async processMessage(message: Message) {
    try {
      if (!message.Body) {
        this.logger.warn('⚠️ Message has no body');
        return;
      }

      // Parse message body
      let messageData: ImpactQueueMessage;
      
      try {
        const parsedBody = JSON.parse(message.Body);
        
        // Check if message is wrapped by EventBridge/SNS (has "Message" field)
        if (parsedBody.Message) {
          // EventBridge wrapping
          messageData = typeof parsedBody.Message === 'string' 
            ? JSON.parse(parsedBody.Message)
            : parsedBody.Message;
        } else if (parsedBody.detail) {
          // EventBridge direct format
          messageData = parsedBody.detail;
        } else {
          // Direct SQS message
          messageData = parsedBody;
        }
      } catch (parseError) {
        this.logger.error('❌ Failed to parse message body:', parseError);
        this.logger.debug('Raw message body:', message.Body);
        await this.deleteMessage(message.ReceiptHandle);
        return;
      }

      // Validate message data
      if (!messageData.newsId || !messageData.symbol || !messageData.publishedAt || !messageData.timeframe) {
        this.logger.error('❌ Invalid message data - missing required fields:', {
          newsId: messageData.newsId,
          symbol: messageData.symbol,
          publishedAt: messageData.publishedAt,
          timeframe: messageData.timeframe,
        });
        this.logger.debug('Full message data:', messageData);
        await this.deleteMessage(message.ReceiptHandle);
        return;
      }
      
      this.logger.log(
        `📊 Processing impact for newsId=${messageData.newsId}, ` +
        `symbol=${messageData.symbol}, timeframe=${messageData.timeframe}`
      );

      // Phân tích impact
      await this.impactAnalysisService.analyzeImpact(
        messageData.newsId,
        messageData.symbol,
        new Date(messageData.publishedAt),
        messageData.timeframe,
      );

      // Xóa message khỏi queue sau khi xử lý thành công
      await this.deleteMessage(message.ReceiptHandle);
      
      this.logger.log(`✅ Impact analysis completed for newsId=${messageData.newsId}`);
    } catch (error) {
      this.logger.error(
        `❌ Error processing impact message: ${error.message}`,
        error.stack,
      );
      // Message sẽ quay lại queue sau visibility timeout
    }
  }

  private async deleteMessage(receiptHandle: string | undefined) {
    if (!receiptHandle) return;

    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
    } catch (error) {
      this.logger.error('Failed to delete message:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onModuleDestroy() {
    this.logger.log('🛑 Stopping Impact SQS consumer...');
    this.isPolling = false;
  }
}
