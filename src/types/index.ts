import { ApiProperty } from '@nestjs/swagger';

export class Stock {
  @ApiProperty({ description: 'Currency of the stock', example: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Company description', example: 'Apple Inc' })
  description: string;

  @ApiProperty({ description: 'Display symbol', example: 'AAPL' })
  displaySymbol: string;

  @ApiProperty({
    description: 'Financial Instrument Global Identifier',
    example: 'BBG000B9XRY4',
  })
  figi: string;

  @ApiProperty({ description: 'Market Identifier Code', example: 'XNAS' })
  mic: string;

  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Security type', example: 'Common Stock' })
  type: string;

  @ApiProperty({
    description: 'ISIN identifier',
    example: 'US0378331005',
    nullable: true,
  })
  isin: string | null;

  @ApiProperty({ description: 'Share class FIGI', example: 'BBG001S5N8V8' })
  shareClassFIGI: string;

  @ApiProperty({ description: 'Alternative symbol', example: '' })
  symbol2: string;
}

export class QuoteStock {
  @ApiProperty({ description: 'Current Price' })
  c: number;
  @ApiProperty({ description: 'Change' })
  d: number;
  @ApiProperty({ description: 'Percent change' })
  dp: number;
  @ApiProperty({ description: 'High price of the day' })
  h: number;
  @ApiProperty({ description: 'Low price of the day' })
  l: number;
  @ApiProperty({ description: 'Open price of the day' })
  o: number;
  @ApiProperty({ description: 'Previous close the price' })
  pc: number;
}

export interface SearchStock {
  count: number;
  result: Stock[];
}

export interface ResponseListStock {
  dataJson: Stock[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
