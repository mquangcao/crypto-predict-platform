import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupBootstrap } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupBootstrap(app, {
    appName: 'auth-service',
    listenPort: parseInt(process.env.PORT ?? '4001', 10),
    listenHost: process.env.HOST ?? '0.0.0.0',
  });
}
void bootstrap();
