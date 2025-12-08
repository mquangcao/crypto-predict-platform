import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface PriceUpdate {
  symbol: string;
  price: number;
  ts: number;
}

/**
 * Service kết nối tới Binance WebSocket và emit event "price"
 */
@Injectable()
export class BinanceStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BinanceStreamService.name);
  private ws: WebSocket | null = null;
  private readonly emitter = new EventEmitter();

  // các symbol muốn stream realtime
  private readonly symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect() {
    const streams = this.symbols
      .map((s) => s.toLowerCase() + '@trade')
      .join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    this.logger.log(`Connecting to Binance WS: ${url}`);
    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.logger.log('Binance WS connected');
    });

    this.ws.on('message', (data) => {
      try {
        const json = JSON.parse(data.toString());
        const stream = json.stream as string;
        const trade = json.data;
        if (!stream || !trade) return;

        const symbol =
          (trade.s as string) ?? stream.split('@')[0].toUpperCase();
        const price = parseFloat(trade.p as string);
        const ts = (trade.T as number) ?? (trade.E as number) ?? Date.now();

        if (Number.isFinite(price)) {
          const update: PriceUpdate = { symbol, price, ts };
          this.emitter.emit('price', update);
        }
      } catch (err) {
        this.logger.error('Error parsing Binance WS message', err as any);
      }
    });

    this.ws.on('close', (code, reason) => {
      this.logger.warn(
        `Binance WS closed: ${code} ${reason.toString()}`,
      );
      setTimeout(() => this.connect(), 3000);
    });

    this.ws.on('error', (err) => {
      this.logger.error('Binance WS error', err as any);
      this.ws?.close();
    });
  }

  private disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  onPrice(cb: (update: PriceUpdate) => void) {
    this.emitter.on('price', cb);
  }

  offPrice(cb: (update: PriceUpdate) => void) {
    this.emitter.off('price', cb);
  }
}
