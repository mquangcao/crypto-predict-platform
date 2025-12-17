import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CoreModule.forRoot(), DatabaseModule, UserModule],
  exports: [UserModule],
})
export class AppModule {}
