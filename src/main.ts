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
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use a global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ Backend API is running on: http://localhost:${port}`);

  // Webhook is now optional - no blocking errors
  const changeNowService = app.get(ChangeNowService);
  setupOptionalWebhook(changeNowService);
}

async function setupOptionalWebhook(service: ChangeNowService) {
  try {
    // Try to set webhook but don't fail if it doesn't work
    const ngrokUrl = process.env.NGROK_URL;
    if (ngrokUrl) {
      await service.setWebhook(`${ngrokUrl}/transactions/webhook`);
      console.log(`✅ Webhook set to: ${ngrokUrl}/transactions/webhook`);
    } else {
      console.log('ℹ️  NGROK_URL not set, webhook disabled');
    }
  } catch (error: any) {
    console.log(
      '⚠️  Webhook optional - continuing without webhook:',
      error.message,
    );
  }
}

bootstrap();
