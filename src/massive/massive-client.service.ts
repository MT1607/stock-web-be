import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as process from 'node:process';
import { MassiveClientGateway } from './massive-client.gateway';
import WebSocket from 'ws';
import { MassiveResponse } from '../types';

@Injectable()
export class MassiveClientService implements OnModuleInit {
  private readonly massive_url = process.env.MASSIVE_DELAYED_URL_SOCKET;
  private readonly massive_api_key = process.env.MASSIVE_API_KEY;
  private ws: WebSocket;
  private readonly logger = new Logger(MassiveClientService.name);
  private authenticated: boolean = false;

  constructor(private readonly massiveGateway: MassiveClientGateway) {}

  onModuleInit(): any {
    this.connectMassive();
  }

  private connectMassive() {
    this.logger.log('Attempting to connect to Massive Socket: ');
    this.ws = new WebSocket(this.massive_url || '');

    this.ws.on('open', this.handleOpen.bind(this));
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('error', (e) => this.logger.error('Client Error:', e.message));
    this.ws.on('close', this.handleClose.bind(this));
  }

  private handleOpen() {
    this.logger.log('Massive API connection OPEN, Authenticating...');
    this.authenticated = false;
    this.ws.send(
      JSON.stringify({
        action: 'push',
        params: this.massive_api_key,
      }),
    );
  }

  private handleMessage(data: WebSocket.Data) {
    try {
      if (Buffer.isBuffer(data)) {
        const message = JSON.parse(data.toString()) as MassiveResponse;
        console.log('message: ', message);
        if (message.ev === 'status' && message.status === 'auth_success') {
          this.authenticated = true;
          this.logger.log('Authenticated success');
        }
        this.logger.debug(`Massive Data: ${message.ev} @ ${message.sym}`);
        this.massiveGateway.sendToClient(message);
      }
    } catch (e) {
      this.logger.error('Failed to parse Massive API message: ', e);
    }
  }

  public subscribeToTicker(ticker: string): void {
    const fullTicker = `AM.${ticker.toUpperCase()}`;

    if (this.ws.readyState !== WebSocket.OPEN) {
      this.logger.warn(
        `WebSocket not open. Cannot subscribe to ${fullTicker}.`,
      );
      return;
    }

    if (!this.authenticated) {
      this.logger.warn(
        `Not yet authenticated. Waiting 2s before retrying subscription for ${fullTicker}.`,
      );
      setTimeout(() => this.subscribeToTicker(ticker), 2000);
      return;
    }

    this.logger.log(`Subscribing to Massive API: ${fullTicker}`);

    this.ws.send(
      JSON.stringify({
        action: 'subscribe',
        params: fullTicker,
      }),
    );
  }

  private handleClose(code: number, reason: string) {
    this.logger.warn(
      `Massive API connection closed. Code: ${code}, Reason: ${reason}`,
    );
    this.authenticated = false;
    setTimeout(() => this.connectMassive(), 5000);
  }
}
