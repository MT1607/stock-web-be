import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FinnhubService } from './finnhub.service';
import { QuoteStock, ResponseListStock, SearchStock, Stock } from 'src/types';

@ApiTags('Finnhub')
@Controller()
export class FinnhubController {
  constructor(private readonly finnhubService: FinnhubService) {}

  @Get('stock')
  @ApiOperation({ summary: 'Get all stocks from an exchange' })
  @ApiQuery({
    name: 'exchange',
    required: true,
    type: String,
    description: 'Exchange code (default: US)',
    example: 'US',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved stock list',
    type: [Stock],
  })
  async getAllStock(
    @Query('exchange') exchange: string = 'US',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<ResponseListStock> {
    return this.finnhubService.getAllStock(exchange, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Get stock by search' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Symbol or company name',
    example: 'AAPL',
  })
  @ApiQuery({
    name: 'exchange',
    required: false,
    type: String,
    description: 'Exchange code (default:US)',
    example: 'US',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved stock',
  })
  async searchStock(
    @Query('q') q: string = 'AAPL',
    @Query('exchange') exchange: string = 'US',
  ): Promise<SearchStock> {
    return this.finnhubService.searchStock(exchange, q);
  }

  @Get('quote')
  @ApiOperation({ summary: 'Get quote of stock' })
  @ApiQuery({
    name: 'symbol',
    required: true,
    type: String,
    example: 'AAPL',
  })
  async getQuoteStock(
    @Query('symbol') symbol: string = 'AAPL',
  ): Promise<QuoteStock> {
    const upperCaseSymbol = symbol.toUpperCase();
    return this.finnhubService.getQuoteStock(upperCaseSymbol);
  }
}
