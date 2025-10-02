import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    try {
      return await this.transactionsService.getTransactionById(id);
    } catch (err: any) {
      this.logger.error('❌ getTransaction error', err.message);
      return { error: 'Failed to fetch transaction' };
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    try {
      this.logger.log('📥 Received webhook from ChangeNOW');
      return await this.transactionsService.updateTransactionStatus(payload);
    } catch (err: any) {
      this.logger.error('❌ handleWebhook error', err.message);
      return { error: 'Failed to process webhook' };
    }
  }
}
