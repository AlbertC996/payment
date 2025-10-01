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
      this.logger.error('❌ getCurrencies error', err.response?.data || err.message);
      return { error: 'Failed to fetch currencies' };
    }
  }

  @Post('create-order')
  async createOrder(@Body() payload: any) {
    console.log(payload);
    try {
      return await this.changeNowService.createOrder(payload);
    } catch (err: any) {
      this.logger.error('❌ createOrder error', err.response?.data || err.message);
      return { error: 'Failed to create order', details: err.response?.data || err.message };
    }
  }
}
