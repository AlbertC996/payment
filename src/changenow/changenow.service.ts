import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/schemas/transaction.schema';

export interface CreateOrderDto {
  from: string;
  to: string;
  amount: string;
  address: string;
  externalUserId: string;
  country: string;
  paymentMethod: string;
}

export interface CurrencyResponse {
  ticker: string;
  name: string;
  image: string;
  hasExternalId: boolean;
  isFiat: boolean;
  featured: boolean;
  isStable: boolean;
  supportsFixedRate: boolean;
}

@Injectable()
export class ChangeNowService {
  private readonly logger = new Logger(ChangeNowService.name);
  private readonly apiKey = process.env.CHANGENOW_API_KEY;
  private readonly baseUrl = 'https://api.changenow.io/v2';

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async getCurrencies(): Promise<CurrencyResponse[]> {
    try {
      const url = `${this.baseUrl}/exchange/currencies`;
      const response = await axios.get(url, {
        headers: { 'x-changenow-api-key': this.apiKey },
        timeout: 30000,
      });

      this.logger.log(`✅ Fetched ${response.data.length} currencies`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        '❌ Failed to fetch currencies',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch currencies from ChangeNOW');
    }
  }

  async createOrder(
    payload: CreateOrderDto,
  ): Promise<{ payUrl: string; transactionId: string }> {
    const url = `${this.baseUrl}/exchange/fiat`;

    const orderData = {
      from: payload.from || 'USD',
      to: payload.to || 'USDT',
      amount: payload.amount || '100',
      address: payload.address || process.env.WALLET_ADDRESS,
      externalUserId: payload.externalUserId || `user-${Date.now()}`,
      country: payload.country || 'US',
      paymentMethod: payload.paymentMethod || 'card',
    };

    // Validate required fields
    if (
      !orderData.address ||
      orderData.address === 'YOUR_ACTUAL_WALLET_ADDRESS_HERE'
    ) {
      throw new Error(
        'Wallet address is required. Please update WALLET_ADDRESS in .env file',
      );
    }

    try {
      this.logger.log(
        `🔄 Creating order: ${orderData.amount} ${orderData.from} → ${orderData.to}`,
      );

      const response = await axios.post(url, orderData, {
        headers: {
          'x-changenow-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      const responseData = response.data;

      // Save transaction to database
      const transaction = new this.transactionModel({
        orderId: responseData.id || `cn_${Date.now()}`,
        externalUserId: orderData.externalUserId,
        externalOrderId: responseData.id,
        providerCode: 'changenow',
        currencyFrom: orderData.from,
        currencyTo: orderData.to,
        amountFrom: orderData.amount,
        country: orderData.country,
        state: responseData.status || 'created',
        walletAddress: orderData.address,
        paymentMethod: orderData.paymentMethod,
        metadata: responseData,
        status: responseData.status || 'pending',
        createdAt: new Date(),
      });

      await transaction.save();
      this.logger.log(`✅ Order created successfully: ${transaction.orderId}`);

      // Extract payment URL
      const payUrl =
        responseData.payUrl ||
        responseData.redirectUrl ||
        responseData.checkoutUrl;

      if (!payUrl) {
        throw new Error('No payment URL received from ChangeNOW');
      }

      return {
        payUrl,
        transactionId: transaction._id.toString(),
      };
    } catch (error: any) {
      this.logger.error(
        '❌ Failed to create order',
        error.response?.data || error.message,
      );

      // Save failed transaction
      const failedTransaction = new this.transactionModel({
        orderId: `failed_${Date.now()}`,
        externalUserId: payload.externalUserId || 'unknown',
        providerCode: 'changenow',
        currencyFrom: payload.from,
        currencyTo: payload.to,
        amountFrom: payload.amount?.toString() || '0',
        country: payload.country || 'unknown',
        state: 'failed',
        walletAddress: payload.address || 'unknown',
        paymentMethod: payload.paymentMethod || 'card',
        status: 'failed',
        errorType: error.response?.status?.toString() || 'unknown',
        errorMessage: error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message,
        errorDetails: [error.response?.data],
        createdAt: new Date(),
      });

      await failedTransaction.save();
      throw error;
    }
  }

  async setWebhook(url: string): Promise<any> {
    try {
      // Try different webhook endpoints
      const endpoints = [
        `${this.baseUrl}/webhook`,
        `${this.baseUrl}/transactions/webhook`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.post(
            endpoint,
            { url },
            {
              headers: {
                'x-changenow-api-key': this.apiKey,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            },
          );

          this.logger.log(`✅ Webhook set successfully at ${endpoint}`);
          return response.data;
        } catch (error) {
          this.logger.warn(
            `⚠️ Webhook failed for ${endpoint}: ${error.message}`,
          );
          continue;
        }
      }

      throw new Error('All webhook endpoints failed');
    } catch (error: any) {
      this.logger.warn('⚠️ Webhook setup failed (optional feature)');
      // Don't throw error - webhook is optional
      return { warning: 'Webhook not available, using fallback methods' };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.getCurrencies();
      return true;
    } catch (error) {
      return false;
    }
  }
}
