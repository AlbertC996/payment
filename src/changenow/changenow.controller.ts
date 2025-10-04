import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChangeNowService, CreateOrderDto } from './changenow.service';

@Controller('changenow')
export class ChangeNowController {
  private readonly logger = new Logger(ChangeNowController.name);

  constructor(private readonly changeNowService: ChangeNowService) {}

  @Get('currencies')
  async getCurrencies() {
    try {
      this.logger.log('📥 Fetching currencies list');
      const currencies = await this.changeNowService.getCurrencies();
      return {
        success: true,
        data: currencies,
        count: currencies.length,
      };
    } catch (error: any) {
      this.logger.error('❌ getCurrencies error', error.message);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch currencies',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('set-webhook')
  async setWebhook(@Body() payload: { url: string }) {
    try {
      this.logger.log(`🔄 Setting webhook to: ${payload.url}`);
      const result = await this.changeNowService.setWebhook(payload.url);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('❌ setWebhook error', error.message);
      return {
        success: false,
        error: 'Failed to set webhook',
        details: error.message,
      };
    }
  }

  @Post('create-order')
  async createOrder(@Body() payload: CreateOrderDto) {
    try {
      this.logger.log('📥 Creating new order', payload);
      const result = await this.changeNowService.createOrder(payload);

      return {
        success: true,
        data: {
          payUrl: result.payUrl,
          transactionId: result.transactionId,
          message: 'Order created successfully. Redirect to payment page.',
        },
      };
    } catch (error: any) {
      this.logger.error('❌ createOrder error', error.message);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to create order',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('health')
  async healthCheck() {
    try {
      const isConnected = await this.changeNowService.validateConnection();
      return {
        success: true,
        status: 'healthy',
        changenow: isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
