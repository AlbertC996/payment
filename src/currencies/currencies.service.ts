import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CurrenciesService {
  constructor(private readonly httpService: HttpService) {}

  async getCurrencies() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.changenow.io/v2/exchange/currencies',
          {
            headers: {
              'x-changenow-api-key': process.env.CHANGENOW_API_KEY,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error fetching currencies:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch currencies from ChangeNOW');
    }
  }
}
