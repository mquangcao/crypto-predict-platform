import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsSentiment } from '../sentiment/entities/news-sentiment.entity';
import { NewsPriceImpact } from '../impact/entities/news-price-impact.entity';
import { TrainingDataExportService } from './services/training-data-export.service';
import { S3UploadService } from './services/s3-upload.service';
import { TrainingDataSchedulerService } from './services/training-data-scheduler.service';
import { SageMakerInferenceService } from './services/sagemaker-inference.service';
import { AwsS3ClientProvider } from './providers/aws-s3-client.provider';
import { AwsSageMakerClientProvider } from './providers/aws-sagemaker-client.provider';
import { TrainingController } from './controllers/training.controller';
import { PredictionController } from './controllers/prediction.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsSentiment, NewsPriceImpact]),
  ],
  controllers: [TrainingController, PredictionController],
  providers: [
    AwsS3ClientProvider,
    AwsSageMakerClientProvider,
    TrainingDataExportService,
    S3UploadService,
    TrainingDataSchedulerService,
    SageMakerInferenceService,
  ],
  exports: [
    TrainingDataExportService,
    TrainingDataSchedulerService,
    SageMakerInferenceService,
  ],
})
export class TrainingModule {}
