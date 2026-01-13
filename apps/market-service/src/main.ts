import { setupBootstrap } from '@app/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // WebSocket CORS is configured in gateway decorator
  // HTTP CORS is handled by setupBootstrap
  
  await setupBootstrap(app);
}
bootstrap();
