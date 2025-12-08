import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MarketService, Timeframe } from './market.service';

@Controller('market')
export class MarketController {
  private readonly logger = new Logger(MarketController.name);

  constructor(private readonly marketService: MarketService) {}

  @Get('symbols')
  getSymbols() {
    return this.marketService.getSymbols();
  }

  @Get('candles')
  async getCandles(
    @Query('symbol') symbol?: string,
    @Query('tf') timeframe?: string,
    @Query('limit') limit?: string,
  ) {
    if (!symbol) {
      throw new BadRequestException('symbol is required');
    }

    // ✅ Cho phép thiếu tf → default 1m
    const rawTf = (timeframe || '1m').toLowerCase();
    const allowed: Timeframe[] = ['1m', '5m', '1h', '1d'];

    this.logger.log(
      `getCandles symbol=${symbol}, tf=${rawTf}, limit=${limit}`,
    );

    if (!allowed.includes(rawTf as Timeframe)) {
      throw new BadRequestException(
        `Invalid timeframe: ${rawTf}. Allowed: ${allowed.join(', ')}`,
      );
    }

    const parsedLimit = limit ? parseInt(limit, 10) : 200;

    const candles = await this.marketService.getCandles(
      symbol,
      rawTf as Timeframe,
      parsedLimit,
    );

    return {
      symbol,
      timeframe: rawTf,
      candles,
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'market-service' };
  }
}
