import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { getConfig } from '@app/common';
import { 
  SQSClient, 
  ReceiveMessageCommand, 
  DeleteMessageCommand,
  Message 
} from '@aws-sdk/client-sqs';
import { AWS_SQS_CLIENT } from '../providers/aws-sqs-client.provider';
import { SentimentQueueMessage } from '../interfaces/sentiment.interface';
import { SentimentService } from './sentiment.service';

@Injectable()
export class SqsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(SqsConsumerService.name);
  private readonly queueUrl: string;
  private readonly maxMessages: number;
  private readonly waitTimeSeconds: number;
  private readonly visibilityTimeout: number;
  private isPolling = false;

  constructor(
    @Inject(AWS_SQS_CLIENT)
    private readonly sqsClient: SQSClient,
    private readonly sentimentService: SentimentService,
  ) {
    this.queueUrl = getConfig('aws.sqs.sentimentQueueUrl');
    this.maxMessages = getConfig('aws.sqs.maxMessages') || 10;
    this.waitTimeSeconds = getConfig('aws.sqs.waitTimeSeconds') || 20;
    this.visibilityTimeout = getConfig('aws.sqs.visibilityTimeout') || 30;
  }

  onModuleInit() {
    if (!this.queueUrl) {
      this.logger.warn('⚠️ SQS Queue URL not configured, consumer will not start');
      return;
    }
    
    this.logger.log('🚀 Starting SQS consumer...');
    this.startPolling();
  }

  private async startPolling() {
    this.isPolling = true;
    
    while (this.isPolling) {
      try {
        await this.pollMessages();
      } catch (error) {
        this.logger.error('Error in polling loop', error);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
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

    try {
      const response = await this.sqsClient.send(command);
      
      if (response.Messages && response.Messages.length > 0) {
        this.logger.log(`📨 Received ${response.Messages.length} message(s)`);
        
        for (const message of response.Messages) {
          await this.processMessage(message);
        }
      }
    } catch (error) {
      this.logger.error('Failed to receive messages from SQS', error);
    }
  }

  private async processMessage(message: Message) {
    try {
      if (!message.Body) {
        this.logger.warn('Message has no body, skipping');
        return;
      }

      const data: SentimentQueueMessage = JSON.parse(message.Body);
      
      this.logger.log(`🔄 Processing article ${data.articleId}`);
      
      // Call sentiment service to analyze and save
      await this.sentimentService.analyzeAndSave(
        data.articleId,
        data.title,
        data.content
      );

      // Delete message from queue after successful processing
      if (message.ReceiptHandle) {
        await this.deleteMessage(message.ReceiptHandle);
        this.logger.log(`✅ Processed and deleted message for article ${data.articleId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process message`, error);
      // Message will become visible again after visibility timeout
    }
  }

  private async deleteMessage(receiptHandle: string) {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    try {
      await this.sqsClient.send(command);
    } catch (error) {
      this.logger.error('Failed to delete message from SQS', error);
    }
  }

  stopPolling() {
    this.logger.log('⏹️ Stopping SQS consumer...');
    this.isPolling = false;
  }
}
