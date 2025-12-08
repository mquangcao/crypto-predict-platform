import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cho frontend (Next.js) gọi trực tiếp trong dev
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 4002);
}
bootstrap();
