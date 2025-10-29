import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinnhubService } from './finnhub/finnhub/finnhub.service';
import { StockQuoteDataGateway } from './socket/stock-quote-data/stock-quote-data.gateway';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService, FinnhubService, StockQuoteDataGateway],
})
export class AppModule {}
