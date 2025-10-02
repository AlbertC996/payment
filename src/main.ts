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

  // Set the webhook after the app starts
  const changeNowService = app.get(ChangeNowService);
  const ngrokUrl = process.env.NGROK_URL || `http://localhost:${port}`;
  
  // Run the webhook setup in the background to not block the app startup
  setWebhook(changeNowService, ngrokUrl);
}

async function setWebhook(service: ChangeNowService, url: string) {
  try {
    await service.setWebhook(`${url}/transactions/webhook`);
    console.log(`Webhook successfully set to ${url}/transactions/webhook`);
  } catch (error: any) {
    console.error('Failed to set webhook:', error.message);
  }
}

bootstrap();