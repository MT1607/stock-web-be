import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as process from 'node:process';
import { firstValueFrom } from 'rxjs';
import { QuoteStock, ResponseListStock, SearchStock, Stock } from 'src/types';
import WebSocket from 'ws';
import { Cache } from '@nestjs/cache-manager';

const CACHE_KEY_ALL_STOCKS = 'all_stocks';

@Injectable()
export class FinnhubService {
  private readonly logger = new Logger(FinnhubService.name);
  private readonly api_key = process.env.FINNHUB_API_KEY;
  private readonly finnhub_base_url = process.env.FINNHUB_BASE_URL;
  private finnhubWs: WebSocket;

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
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
  ): Promise<ResponseListStock> {
    const cached = await this.cacheManager.get<Stock[]>(
      CACHE_KEY_ALL_STOCKS + '_' + exchange,
    );

    let result: Stock[];

    if (!cached) {
      this.logger.warn('Cache miss: Fetching all stocks from Finnhub...');
      const url = `${this.finnhub_base_url}/stock/symbol`;

      const response = await firstValueFrom(
        this.httpService.get<Stock[]>(url, {
          params: { exchange },
          headers: { 'X-Finnhub-Token': this.api_key },
        }),
      );

      result = response?.data ?? [];

      await this.cacheManager.set(
        CACHE_KEY_ALL_STOCKS + '_' + exchange,
        result,
        86400 * 1000,
      );
    } else {
      this.logger.warn('Cache: Using stocks from cache');
      result = cached;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginationData = result.slice(startIndex, endIndex);
    const total = result.length;
    const totalPage = Math.ceil(result.length / limit);

    return {
      dataJson: paginationData,
      totalItems: total,
      totalPages: totalPage,
      currentPage: page,
    };
  }

  async searchStock(
    exchange: string | undefined,
    q: string,
  ): Promise<SearchStock> {
    const url = `${this.finnhub_base_url}/search`;
    const params: { q: string; exchange?: string } = { q };

    if (exchange) {
      params.exchange = exchange;
    }

    const response = await firstValueFrom(
      this.httpService.get<SearchStock>(url, {
        params: params,
        headers: { 'X-Finnhub-Token': this.api_key },
      }),
    );

    return response.data;
  }

  async getQuoteStock(symbol: string): Promise<QuoteStock> {
    const url = `${this.finnhub_base_url}/quote`;

    const response = await firstValueFrom(
      this.httpService.get<QuoteStock>(url, {
        params: { symbol },
        headers: { 'X-Finnhub-Token': this.api_key },
      }),
    );

    this.logger.log('data quote: ', response);
    return response.data;
  }
}
