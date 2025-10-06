import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../currencies/schemas/transaction.schema';

export interface CreateOrderPayload {
  fromCurrency?: string;
  toCurrency?: string;
  fromAmount?: string | number;
  address?: string;
  externalUserId?: string;
  country?: string;
  paymentMethod?: string;
  email?: string;
}

export interface CreateOrderResult {
  respData: any;
  savedTransactionId: string;
  payUrl?: string;
}

@Injectable()
export class ChangeNowService {
  private readonly logger = new Logger(ChangeNowService.name);
  private readonly apiKey = process.env.CHANGENOW_API_KEY;

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  /** 📦     ChangeNOW */
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
        '❌ Failed to fetch currencies from ChangeNOW',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch currencies from ChangeNOW');
    }
  }

  /** 💳      (Fiat → Crypto) */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    const endpoint = 'https://api.changenow.io/v2/exchange/by-card';

    // 🧩       API
    const fromCurrency = payload.fromCurrency ?? (payload as any).currencyFrom;
    const toCurrency = payload.toCurrency ?? (payload as any).currencyTo;
    const fromAmount = payload.fromAmount ?? (payload as any).amount;

    const body = {
      fromCurrency,
      toCurrency,
      fromAmount,
      address: payload.address ?? process.env.WALLET_ADDRESS,
      country: payload.country ?? 'US',
      paymentMethod: payload.paymentMethod ?? 'card',
      email: payload.email ?? '',
    };

    try {
      const res: AxiosResponse = await axios.post(endpoint, body, {
        headers: {
          'x-changenow-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      const respData = res.data;

      // 🧾    
      const tx = new this.transactionModel({
        orderId: respData.id || `cn_${Date.now()}`,
        externalUserId:
          payload.externalUserId ?? payload.email ?? `user-${Date.now()}`,
        externalOrderId: respData.id || null,
        providerCode: 'changenow',
        currencyFrom: fromCurrency, // 👈    ‌
        currencyTo: toCurrency, // 👈    ‌
        amountFrom: fromAmount?.toString() ?? '0',
        country: payload.country ?? 'US',
        state: respData.status || 'created',
        walletAddress: payload.address ?? process.env.WALLET_ADDRESS,
        paymentMethod: payload.paymentMethod ?? 'card',
        metadata: respData,
        status: respData.status || 'pending',
      });

      await tx.save();

      const payUrl: string | undefined =
        respData.payUrl || respData.redirectUrl || respData.checkoutUrl;

      return {
        respData,
        savedTransactionId: tx._id.toString(),
        payUrl,
      };
    } catch (error: any) {
      this.logger.error(
        '❌ Failed to create order with ChangeNOW',
        error.response?.data || error.message,
      );

      const errTx = new this.transactionModel({
        orderId: `failed_${Date.now()}`,
        externalUserId: payload.externalUserId ?? 'unknown',
        providerCode: 'changenow',
        currencyFrom: fromCurrency,
        currencyTo: toCurrency,
        amountFrom: fromAmount?.toString() ?? '0',
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

  /** 🔔  Webhook  ChangeNOW */
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

      this.logger.log(`✅ Webhook successfully set to ${url}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        '❌ Failed to set webhook:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to set webhook');
    }
  }
}
