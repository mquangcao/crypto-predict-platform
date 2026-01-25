import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    DatabaseModule,
    PlanModule,
  ],
})
export class AppModule {}
