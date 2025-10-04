import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    try {
      this.logger.log(`📥 Fetching transaction: ${id}`);
      const transaction = await this.transactionsService.getTransactionById(id);
      return {
        success: true,
        data: transaction,
      };
    } catch (error: any) {
      this.logger.error(`❌ getTransaction error for ID ${id}`, error.message);
      throw new HttpException(
        {
          success: false,
          error: 'Transaction not found',
          details: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get()
  async getAllTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      this.logger.log(
        `📥 Fetching transactions page ${pageNum}, limit ${limitNum}`,
      );

      const result = await this.transactionsService.getAllTransactions(
        pageNum,
        limitNum,
      );

      return {
        success: true,
        data: result.transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          pages: Math.ceil(result.total / limitNum),
        },
      };
    } catch (error: any) {
      this.logger.error('❌ getAllTransactions error', error.message);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch transactions',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    try {
      this.logger.log('📥 Received webhook from ChangeNOW', payload);
      const result =
        await this.transactionsService.updateTransactionStatus(payload);

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('❌ handleWebhook error', error.message);

      // Don't return error to webhook caller to prevent retries for not found
      if (error.status === 404) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      throw new HttpException(
        {
          success: false,
          error: 'Failed to process webhook',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('external/:externalId')
  async getTransactionByExternalId(@Param('externalId') externalId: string) {
    try {
      this.logger.log(`📥 Fetching transaction by external ID: ${externalId}`);
      const transaction =
        await this.transactionsService.getTransactionByExternalId(externalId);
      return {
        success: true,
        data: transaction,
      };
    } catch (error: any) {
      this.logger.error(
        `❌ getTransactionByExternalId error for ${externalId}`,
        error.message,
      );
      throw new HttpException(
        {
          success: false,
          error: 'Transaction not found',
          details: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
