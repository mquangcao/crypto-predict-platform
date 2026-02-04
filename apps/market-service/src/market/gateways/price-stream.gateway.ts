import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { getConfig } from '@app/common';
import { BinanceStreamService } from '../services/binance-stream.service';
import { PriceUpdate } from '../interfaces/market-service.interface';

@WebSocketGateway({
  namespace: 'price',
  cors: getConfig('market.websocket.cors'),
})
export class PriceStreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PriceStreamGateway.name);

  constructor(private readonly binanceStream: BinanceStreamService) {
    // lắng event price từ service và broadcast cho clients
    this.binanceStream.onPrice((update: PriceUpdate) => {
      if (this.server) {
        this.server.emit('price', update);
      }
    });
  }

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
