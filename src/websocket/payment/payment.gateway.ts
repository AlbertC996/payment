import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class PaymentGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('payment:initiate')
  handlePaymentInitiate(@MessageBody() data: any) {

  }
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
