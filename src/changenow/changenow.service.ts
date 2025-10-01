import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../currencies/schemas/transaction.schema';

@Injectable()
export class ChangeNowService {
  private readonly logger = new Logger(ChangeNowService.name);
  private apiKey = process.env.CHANGENOW_API_KEY || '';

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async getCurrencies() {
    try {
      const url = 'https://api.changenow.io/v2/exchange/currencies';
      const res = await axios.get(url, {
        headers: { 'x-changenow-api-key': this.apiKey },
        timeout: 30000,
      });
      return res.data;
    } catch (error: any) {
      this.logger.error(
        '❌ getCurrencies error',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch currencies from ChangeNOW');
    }
  }

  async createOrder(payload: any) {
    const url = 'https://api.changenow.io/v2/exchange';

    const body = {
      fromCurrency: payload.from || 'usd',
      toCurrency: payload.to || 'usdt',
      fromAmount: payload.amount || 100,
      address: payload.address || process.env.WALLET_ADDRESS,

      // 👇 اضافه شد
      toNetwork: payload.toNetwork || 'tron', // برای USDT-TRC20
      fromNetwork: payload.fromNetwork || 'visa', // برای پرداخت با کارت یا بانک
    };

    try {
      const res = await axios.post(url, body, {
        headers: {
          'x-changenow-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      return res.data;
    } catch (error: any) {
      this.logger.error(
        '❌ createOrder error',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
