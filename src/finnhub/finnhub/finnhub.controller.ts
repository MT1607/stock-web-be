import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FinnhubService } from './finnhub.service';
import { ResponseListStock, Stock } from 'src/types';

@ApiTags('Finnhub')
@Controller('stock')
export class FinnhubController {
  constructor(private readonly finnhubService: FinnhubService) {}

  @Get()
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
}
