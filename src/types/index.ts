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

export interface SearchStock {
  count: number;
  result: Stock[];
}
