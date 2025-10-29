import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { FinnhubService } from 'src/finnhub/finnhub/finnhub.service';
import { Server, WebSocket } from 'ws';

@WebSocketGateway(8080)
export class StockQuoteDataGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(StockQuoteDataGateway.name);

  @WebSocketServer() server: Server;
  private subcribeSymbols = new Set<string>();

  constructor(private finnhubService: FinnhubService) {
    this.finnhubService.onDataReceived((data: string) => {
      this.broadcastToClients(data);
    });
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    this.logger.log('Client connected: ', client, args);
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('Client disconnect: ', client);
  }

  @SubscribeMessage('subscribe')
  handleSubcribe(client: WebSocket, payload: { symbol: string }) {
    const symbol = payload.symbol?.toUpperCase();
    if (!symbol) return;

    if (!this.subcribeSymbols.has(symbol)) {
      this.finnhubService.sendCommand('subscribe', symbol);
      this.subcribeSymbols.add(symbol);
    }
    this.logger.log(`Client subscribed to: ${symbol}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubcribe(client: WebSocket, payload: { symbol: string }) {
    const symbol = payload.symbol?.toUpperCase();
    if (!symbol) return;

    if (this.subcribeSymbols.has(symbol)) {
      this.finnhubService.sendCommand('unsubscribe', symbol);
      this.subcribeSymbols.delete(symbol);
    }
    this.logger.log(`Client unsubscribed from: ${symbol}`);
  }

  private broadcastToClients = (data: string) => {
    this.server?.clients?.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
}
