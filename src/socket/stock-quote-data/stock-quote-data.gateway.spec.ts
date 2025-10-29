import { Test, TestingModule } from '@nestjs/testing';
import { StockQuoteDataGateway } from './stock-quote-data.gateway';

describe('StockQuoteDataGateway', () => {
  let gateway: StockQuoteDataGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockQuoteDataGateway],
    }).compile();

    gateway = module.get<StockQuoteDataGateway>(StockQuoteDataGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
