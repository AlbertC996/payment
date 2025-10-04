import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChangeNowService } from './changenow/changenow.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the Next.js frontend
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use a global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away any properties that do not have any decorators
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted values are provided
      transform: true, // Automatically transforms payloads to be objects typed according to their DTO classes
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend API is running on: http://localhost:${port}`);

  // اگر نیاز به ثبت وب‌هوک بود، دستی از طریق API فراخوانی کن
}

async function setWebhook(service: ChangeNowService, url: string) {
  // این تابع دیگر به صورت خودکار فراخوانی نمی‌شود
}

bootstrap();