import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsSentiment } from './entities/news-sentiment.entity';
import { SentimentService } from './services/sentiment.service';
import { SqsConsumerService } from './services/sqs-consumer.service';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsSentiment]),
  ],
  providers: [
    AwsSqsClientProvider,
    SentimentService,
    SqsConsumerService,
  ],
  exports: [SentimentService],
})
export class SentimentModule {}
