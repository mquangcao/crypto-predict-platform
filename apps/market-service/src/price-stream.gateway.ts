import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  BinanceStreamService,
  PriceUpdate,
} from './binance-stream.service';

@WebSocketGateway({
  namespace: 'price',
  cors: {
    origin: 'http://localhost:3000',
    credentials: false,
  },
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
