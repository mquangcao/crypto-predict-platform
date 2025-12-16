import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from '@app/core';

@Module({
  imports: [CoreModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
