import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChangeNowModule } from './changenow/changenow.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsModule } from './transactions/transactions.module';
import { config } from '../config';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || config.database.mongodbUri,
      {
        // optional mongoose options
        autoIndex: true,
      },
    ),
    ChangeNowModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
