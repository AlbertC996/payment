### G:\B\AA-Cloned-Projects\payment-project\payment\👇
1. .env => (
CHANGENOW_API_KEY=59a872881b02ff62c9cd8ed4aa3f67517a7b5530368e6845b3030b7f111cbab2
WALLET_ADDRESS=YourTestBestwalletAddressHere
MONGODB_URI=mongodb://localhost:27017/payment
PORT=3000
NGROK_URL=https://lakiesha-nontautomeric-awestruckly.ngrok-free.dev
)
2. .prettierrc => (
{
  "singleQuote": true,
  "trailingComma": "all"
}
)
3. config.ts => (
// Copy this file to config.ts and fill in your actual values
export const config = {
  changelly: {
    privateKey: process.env.CHANGELLY_API_SECRET || '',
    publicKey: process.env.CHANGELLY_API_KEY || '',
    walletAddress: process.env.WALLET_ADDRESS || '',
  },
  database: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payment',
  },
  server: {
    port: process.env.PORT || 3000,
  },
};

)
4. package.json => (
{
  "name": "changelly-api",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/axios": "^4.0.1",
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/mongoose": "^11.0.0",
    "@nestjs/platform-express": "^11.0.1",
    "axios": "^1.12.2",
    "crypto": "^1.0.1",
    "dotenv": "^17.2.2",
    "mongoose": "^8.0.3",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@types/express": "^5.0.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.10.7",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^16.0.0",
    "jest": "^30.0.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}

)
5. tsconfig.build.json => (
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}

)
6. tsconfig.json => (
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}

)
### G:\B\AA-Cloned-Projects\payment-project\payment\src\👇
1. main.ts => (
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

)
2. app.module.ts => (
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChangeNowModule } from './changenow/changenow.module';

@Module({
  imports: [ChangeNowModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

)
3. app.controller.ts => (
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return { message: 'API is working 🚀' };
  }
}

)
4. app.controller.spec.ts => (
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

)
5. app.service.ts => (
import { Injectable } from '@nestjs/common';
import { ChangeNowService } from './changenow/changenow.service';

@Injectable()
export class AppService {
  constructor(private readonly changeNowService: ChangeNowService) {}

  async getCurrenciesList() {
    return this.changeNowService.getCurrencies();
  }
}

)
### G:\B\AA-Cloned-Projects\payment-project\payment\src\currencies\👇
1. currencies.module.ts => (
import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}

)
2. currencies.controller.ts => (
import { Controller, Get } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async getCurrencies() {
    return this.currenciesService.getCurrencies();
  }
}

)
3. currencies.service.ts => (
// payment/src/currencies/currencies.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CurrenciesService {
  constructor(private readonly httpService: HttpService) {}

  async getCurrencies() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.changenow.io/v2/currencies?active=true',
          {
            headers: {
              'x-changenow-api-key': process.env.CHANGENOW_API_KEY,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error fetching currencies:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch currencies from ChangeNOW');
    }
  }
}

)
### G:\B\AA-Cloned-Projects\payment-project\payment\src\currencies\schemas\👇
1. transaction.schema.ts => (
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  externalUserId: string;

  @Prop({ required: true })
  externalOrderId: string;

  @Prop({ required: true })
  providerCode: string;

  @Prop({ required: true })
  currencyFrom: string;

  @Prop({ required: true })
  currencyTo: string;

  @Prop({ required: true })
  amountFrom: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  state?: string;

  @Prop()
  ip?: string;

  @Prop({ required: true })
  walletAddress: string;

  @Prop()
  walletExtraId?: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  metadata?: any;

  @Prop()
  redirectUrl?: string;

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop()
  errorType?: string;

  @Prop()
  errorMessage?: string;

  @Prop({ type: [Object] })
  errorDetails?: any[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

)
### G:\B\AA-Cloned-Projects\payment-project\payment\src\changenow\👇
1. changenow.module.ts => (
import { Module } from '@nestjs/common';
import { ChangeNowController } from './changenow.controller';
import { ChangeNowService } from './changenow.service';

@Module({
  controllers: [ChangeNowController],
  providers: [ChangeNowService],
  exports: [ChangeNowService],
})
export class ChangeNowModule {}

)
2. changenow.controller.ts => (
import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChangeNowService } from './changenow.service';

@Controller('changenow')
export class ChangeNowController {
  constructor(private readonly service: ChangeNowService) {}

  @Get('currencies')
  async currencies() {
    try {
      return await this.service.getCurrencies();
    } catch (err: any) {
      throw new HttpException({ error: err.message }, HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('create-order')
  async createOrder(@Body() body: any) {
    try {
      return await this.service.createOrder(body);
    } catch (err: any) {
      const message = err?.response?.data || err.message || 'Unknown';
      throw new HttpException({ error: message }, HttpStatus.BAD_GATEWAY);
    }
  }
}

)
3. changenow.service.ts => (
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChangeNowService {
  private apiKey = process.env.CHANGENOW_API_KEY || '';

  async getCurrencies() {
    const url = 'https://api.changenow.io/v2/currencies?active=true';
    const res = await axios.get(url, {
      headers: {
        'x-changenow-api-key': this.apiKey,
        Accept: 'application/json',
      },
      timeout: 15000,
    });
    return res.data;
  }

  async createOrder(payload: any) {
    const url = 'https://api.changenow.io/v2/orders';
    const body = {
      from: payload.from,
      to: payload.to,
      amount: payload.amount,
      address: payload.address,
      extraId: payload.extraId || undefined,
    };

    const res = await axios.post(url, body, {
      headers: {
        'x-changenow-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });

    return res.data;
  }
}

)
