import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChangeNowService {
  private apiKey = process.env.CHANGENOW_API_KEY || '';

  async getCurrencies() {
    const url = 'https://api.changenow.io/v2/currencies?active=true';
    const res = await axios.get(url, {
      headers: {
        'x-changenow-api-key': this.apiKey,
        Accept: 'application/json',
      },
      timeout: 15000,
    });
    return res.data;
  }

  async createOrder(payload: any) {
    const url = 'https://api.changenow.io/v2/orders';
    const body = {
      from: payload.from,
      to: payload.to,
      amount: payload.amount,
      address: payload.address,
      extraId: payload.extraId || undefined,
    };

    const res = await axios.post(url, body, {
      headers: {
        'x-changenow-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });

    return res.data;
  }
}
