import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../currencies/schemas/transaction.schema';

// اینترفیس برای ورودی سفارش
export interface CreateOrderPayload {
  from?: string;
  to?: string;
  amount?: string | number;
  address?: string;
  externalUserId?: string;
  country?: string;
  paymentMethod?: string;
}

// اینترفیس برای خروجی سفارش
export interface CreateOrderResult {
  changenow: any;
  savedTransactionId: string;
  payUrl: string | undefined;
}

@Injectable()
export class ChangeNowService {
  private readonly logger = new Logger(ChangeNowService.name);
  private readonly apiKey = process.env.CHANGENOW_API_KEY;

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  // دریافت لیست ارزها از ChangeNOW
  async getCurrencies(): Promise<any> {
    try {
      const url = 'https://api.changenow.io/v2/exchange/currencies';
      const res: AxiosResponse = await axios.get(url, {
        headers: { 'x-changenow-api-key': this.apiKey },
        timeout: 30000,
      });
      return res.data;
    } catch (error: any) {
      this.logger.error(
        'Failed to fetch currencies from ChangeNOW',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch currencies from ChangeNOW');
    }
  }

  // ایجاد سفارش جدید و ذخیره در دیتابیس
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    const url = 'https://api.changenow.io/v2/exchange/fiat';

    // ساخت بدنه سفارش با مقادیر پیش‌فرض
    const body = {
      from: payload.from ?? 'USD',
      to: payload.to ?? 'USDT',
      amount: payload.amount ?? '100',
      address: payload.address ?? process.env.WALLET_ADDRESS,
      externalUserId: payload.externalUserId ?? 'test-user-1',
      country: payload.country ?? 'US',
      paymentMethod: payload.paymentMethod ?? 'card',
    };

    try {
      const res: AxiosResponse = await axios.post(url, body, {
        headers: {
          'x-changenow-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      const respData = res.data;

      // ذخیره تراکنش موفق
      const tx = new this.transactionModel({
        orderId: respData.id || `cn_${Date.now()}`,
        externalUserId: body.externalUserId,
        externalOrderId: respData.id || null,
        providerCode: 'changenow',
        currencyFrom: body.from,
        currencyTo: body.to,
        amountFrom: body.amount,
        country: body.country,
        state: respData.status || 'created',
        walletAddress: body.address,
        paymentMethod: body.paymentMethod,
        metadata: respData,
        status: respData.status || 'pending',
      });

      await tx.save();

      // استخراج لینک پرداخت
      const payUrl: string | undefined =
        respData.payUrl || respData.redirectUrl || respData.checkoutUrl;

      return {
        changenow: respData,
        savedTransactionId: tx._id.toString(),
        payUrl,
      };
    } catch (error: any) {
      this.logger.error(
        'Failed to create order with ChangeNOW',
        error.response?.data || error.message,
      );

      // ذخیره تراکنش ناموفق
      const errTx = new this.transactionModel({
        orderId: `failed_${Date.now()}`,
        externalUserId: payload.externalUserId ?? 'unknown',
        providerCode: 'changenow',
        currencyFrom: payload.from,
        currencyTo: payload.to,
        amountFrom: payload.amount?.toString() ?? '0',
        country: payload.country ?? 'unknown',
        state: 'failed',
        walletAddress: payload.address ?? process.env.WALLET_ADDRESS,
        paymentMethod: payload.paymentMethod ?? 'card',
        status: 'failed',
        errorType: error.response?.status ?? 'unknown',
        errorMessage: error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message,
      });

      await errTx.save();

      throw error;
    }
  }

  // ست کردن وب‌هوک برای دریافت وضعیت تراکنش‌ها
  async setWebhook(url: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        'https://api.changenow.io/v2/transactions/webhook',
        { url },
        {
          headers: {
            'x-changenow-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Webhook successfully set to ${url}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        'Failed to set ChangeNOW webhook',
        error.response?.data || error.message,
      );
      // فقط لاگ کن و پروژه را متوقف نکن
      return {
        error: 'Failed to set webhook',
        details: error.response?.data || error.message,
      };
    }
  }
}
