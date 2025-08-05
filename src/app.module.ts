import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { FraudModule } from './fraud/fraud.module';
import { WebsocketModule } from './websocket/websocket.module';

import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PaymentModule, FraudModule, WebsocketModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
