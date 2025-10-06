import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ChangeNowService } from './changenow.service';

@Controller('changenow')
export class ChangeNowController {
  private readonly logger = new Logger(ChangeNowController.name);

  constructor(private readonly changeNowService: ChangeNowService) {}

  @Get('currencies')
  async getCurrencies() {
    try {
      return await this.changeNowService.getCurrencies();
    } catch (err: any) {
      this.logger.error(
        'getCurrencies error',
        err.response?.data || err.message,
      );
      return { error: 'Failed to fetch currencies' };
    }
  }

  @Post('set-webhook')
  async setWebhook(@Body() payload: { url: string }) {
    try {
      return await this.changeNowService.setWebhook(payload.url);
    } catch (err: any) {
      this.logger.error('setWebhook error', err.response?.data || err.message);
      return {
        error: 'Failed to set webhook',
        details: err.response?.data || err.message,
      };
    }
  }

  @Post('create-order')
  async createOrder(@Body() payload: any) {
    try {
      const result = await this.changeNowService.createOrder(payload);
      console.log('🟢 Payload from frontend:', payload);

      if (result.payUrl) {
        return {
          success: true,
          payUrl: result.payUrl,
          transactionId: result.savedTransactionId,
          message: 'Please redirect to the payment page',
        };
      }

      return result;
    } catch (err: any) {
      this.logger.error('createOrder error', err.response?.data || err.message);
      return {
        success: false,
        error: 'Failed to create order',
        details: err.response?.data || err.message,
      };
    }
  }
}
