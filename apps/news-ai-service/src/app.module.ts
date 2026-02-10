import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from '@app/core';

import { DatabaseModule } from './database/database.module';
import { SentimentModule } from './sentiment/sentiment.module';
import { ImpactModule } from './impact/impact.module';
import { TrainingModule } from './training/training.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    SentimentModule,
    ImpactModule,
    TrainingModule,
  ]
})
export class AppModule {}
