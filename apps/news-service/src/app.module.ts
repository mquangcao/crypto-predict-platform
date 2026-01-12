import { getConfig } from '@app/common';
import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database/database.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    NewsModule,
  ],
})
export class AppModule {}
