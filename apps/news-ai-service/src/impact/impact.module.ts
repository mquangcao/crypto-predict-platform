import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@app/core';

import { NewsPriceImpact } from './entities/news-price-impact.entity';
import { ImpactAnalysisService } from './services/impact-analysis.service';
import { TechnicalIndicatorService } from './services/technical-indicator.service';
import { SqsImpactConsumerService } from './services/sqs-impact-consumer.service';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsPriceImpact]),
    CoreModule.forRoot(),
  ],
  providers: [
    AwsSqsClientProvider,
    ImpactAnalysisService,
    TechnicalIndicatorService,
    SqsImpactConsumerService,
  ],
  exports: [ImpactAnalysisService],
})
export class ImpactModule {}
