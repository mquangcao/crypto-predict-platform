import { getConfig } from '@app/common';
import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    DatabaseModule,
    AuthModule.forRoot({
      jwtSecret: getConfig('token.secret'),
      jwtExpiresIn: getConfig('token.expiresIn'),
    }),
  ],
})
export class AppModule {}
