// payment/src/main.ts
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const publicPath = join(process.cwd(), 'public');
  app.useStaticAssets(publicPath);

  const server = app.getHttpAdapter().getInstance() as express.Application;
  server.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/changenow')) {
      return next(); // API routes → Nest
    }
    res.sendFile(join(publicPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
