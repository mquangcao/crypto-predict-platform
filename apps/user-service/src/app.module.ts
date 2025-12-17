import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';

@Module({
  imports: [CoreModule.forRoot(), DatabaseModule],
})
export class AppModule {}
