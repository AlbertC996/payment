import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../currencies/schemas/transaction.schema';

export interface CreateOrderPayload {
  from_currency?: string;
  to_currency?: string;
  from_amount?: string | number;
  address?: string;
  external_user_id?: string;
  country?: string;
  payment_method?: string;
}

//
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
  ) { }

  //     ChangeNOW
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

  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    const normalizedPayload = {
      from_currency: (payload as any).from_currency || (payload as any).from,
      to_currency: (payload as any).to_currency || (payload as any).to,
      from_amount: (payload as any).from_amount || (payload as any).amount,
      address: payload.address ?? process.env.WALLET_ADDRESS,
      external_user_id: (payload as any).external_user_id || (payload as any).externalUserId || `user-${Date.now()}`,
      country: payload.country,
      payment_method: (payload as any).payment_method || (payload as any).paymentMethod || 'card',
      email: (payload as any).email ?? '',
    };

    const url = 'https://api.changenow.io/v2/exchange/fiat';

    const body = {
      from: normalizedPayload.from_currency,
      to: normalizedPayload.to_currency,
      amount: normalizedPayload.from_amount,
      address: normalizedPayload.address,
      externalUserId: normalizedPayload.external_user_id,
      country: normalizedPayload.country,
      paymentMethod: normalizedPayload.payment_method,
      email: normalizedPayload.email,
    };

    try {
      const res = await axios.post(url, body, {
        headers: {
          'x-changenow-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      const respData = res.data;

      const tx = new this.transactionModel({
        orderId: respData.id || `cn_${Date.now()}`,
        externalUserId: normalizedPayload.external_user_id,
        externalOrderId: respData.id || null,
        providerCode: 'changenow',
        currencyFrom: normalizedPayload.from_currency,
        currencyTo: normalizedPayload.to_currency,
        amountFrom: normalizedPayload.from_amount?.toString() ?? '0',
        country: normalizedPayload.country,
        state: respData.status || 'created',
        walletAddress: normalizedPayload.address,
        paymentMethod: normalizedPayload.payment_method,
        metadata: respData,
        status: respData.status || 'pending',
      });

      await tx.save();

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

      const errTx = new this.transactionModel({
        orderId: `failed_${Date.now()}`,
        externalUserId: normalizedPayload.external_user_id ?? 'unknown',
        providerCode: 'changenow',
        currencyFrom: normalizedPayload.from_currency,
        currencyTo: normalizedPayload.to_currency,
        amountFrom: normalizedPayload.from_amount?.toString() ?? '0',
        country: normalizedPayload.country ?? 'unknown',
        state: 'failed',
        walletAddress: normalizedPayload.address ?? process.env.WALLET_ADDRESS,
        paymentMethod: normalizedPayload.payment_method ?? 'card',
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          'Axios error:',
          error.response?.data || error.message,
        );
      } else if (error instanceof Error) {
        this.logger.error('Generic error:', error.message);
      } else {
        this.logger.error('Unknown error type', JSON.stringify(error));
      }
    }
  }
}