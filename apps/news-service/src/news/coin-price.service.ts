import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoinPriceService {
  private readonly logger = new Logger(CoinPriceService.name);
  private readonly baseUrl = 'https://api.binance.com/api/v3';

  constructor(private readonly httpService: HttpService) {}

  async getCurrentPrices(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']): Promise<Record<string, number>> {
    try {
      const prices: Record<string, number> = {};

      for (const symbol of symbols) {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/ticker/price`, {
              params: { symbol },
            })
          );

          if (response.data && response.data.price) {
            const coinName = symbol.replace('USDT', '');
            prices[coinName] = parseFloat(response.data.price);
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch price for ${symbol}`);
        }
      }

      this.logger.log(`Fetched prices: ${JSON.stringify(prices)}`);
      return prices;
    } catch (error) {
      this.logger.error('Error fetching coin prices:', error.message);
      return {};
    }
  }
}
