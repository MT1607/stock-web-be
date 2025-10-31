import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as process from 'node:process';
import { firstValueFrom } from 'rxjs';
import { Stock } from 'src/types';
import WebSocket from 'ws';

@Injectable()
export class FinnhubService {
  private readonly logger = new Logger(FinnhubService.name);
  private readonly api_key = process.env.FINNHUB_API_KEY;
  private readonly finnhub_base_url = process.env.FINNHUB_BASE_URL;
  private finnhubWs: WebSocket;

  constructor(private readonly httpService: HttpService) {
    this.connectFinnhub();
  }

  // WebSocket Finnhub
  private connectFinnhub() {
    const key = process.env.FINNHUB_API_KEY;
    const url = process.env.FINNHUB_WS_URL;
    const socketUrl = `${url}?token=${key}`;

    this.finnhubWs = new WebSocket(socketUrl);

    this.finnhubWs.on('open', () => {
      this.logger.log('Connected to Finnhub');
    });

    this.finnhubWs.on('error', (error) => {
      this.logger.error('Finnhub connect error: ', error);
    });

    this.finnhubWs.on('close', () => {
      this.logger.warn('Finnhub connection closed');
    });
  }

  sendCommand(type: 'subscribe' | 'unsubscribe', symbol: string) {
    if (this.finnhubWs && this.finnhubWs.readyState === WebSocket.OPEN) {
      this.finnhubWs.send(JSON.stringify({ type, symbol }));
      this.logger.log(`-> Sent ${type} command for ${symbol}`);
    } else {
      this.logger.warn(`WS Finnhub is not connected`);
    }
  }

  onDataReceived(callback: (data: string) => void) {
    this.finnhubWs.on('message', (data: WebSocket.RawData) => {
      let text: string;

      if (typeof data === 'string') {
        text = data;
      } else if (data instanceof Buffer) {
        text = data.toString('utf8');
      } else if (Array.isArray(data)) {
        // Buffer[] case
        text = Buffer.concat(data).toString('utf8');
      } else if (data instanceof ArrayBuffer) {
        text = Buffer.from(data).toString('utf8');
      } else {
        // Fallback: attempt JSON stringify, otherwise coerce to string
        try {
          text = JSON.stringify(data);
        } catch {
          text = String(data);
        }
      }

      callback(text);
    });
  }

  // Rest API
  async getAllStock(
    exchange: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<Stock[]> {
    const url = `${this.finnhub_base_url}/stock/symbol`;

    const response = await firstValueFrom(
      this.httpService.get<Stock[]>(url, {
        params: { exchange },
        headers: { 'X-Finnhub-Token': this.api_key },
      }),
    );

    const result = response?.data;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginationData = result.slice(startIndex, endIndex);

    return paginationData;
  }
}
