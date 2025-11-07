import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Logger } from '@nestjs/common';

@WebSocketGateway(4040, { cors: { origin: '*' } })
export class MassiveClientGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(MassiveClientGateway.name);

  handleConnection(client: WebSocket, ...args): any {
    this.logger.log('Client connected: ', { client });
    this.logger.log('Client args: ', args);
    client.send(
      JSON.stringify({
        status: 'connected',
        message: 'Welcome to Massive Nestjs Socket',
      }),
    );
  }

  handleDisconnect(client: WebSocket): any {
    this.logger.log('Client disconnected: ', { client });
  }

  public sendToClient(data: any): void {
    const payload = JSON.stringify(data);
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  @SubscribeMessage('subcribeStock')
  handleSubcribe(@MessageBody() data: string): void {
    this.logger.log(`Frontend requested subscription: ${data}`);
  }
}
