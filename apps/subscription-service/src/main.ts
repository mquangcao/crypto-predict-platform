import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupBootstrap } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupBootstrap(app);
}
bootstrap();
