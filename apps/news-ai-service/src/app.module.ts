import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database/database.module';
import { SentimentModule } from './sentiment/sentiment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    SentimentModule,
  ]
})
export class AppModule {}
