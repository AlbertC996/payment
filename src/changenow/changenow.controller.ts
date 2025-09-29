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
