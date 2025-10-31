import { Module } from '@nestjs/common';
import { FinnhubService } from './finnhub/finnhub/finnhub.service';
import { StockQuoteDataGateway } from './socket/stock-quote-data/stock-quote-data.gateway';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { FinnhubController } from './finnhub/finnhub/finnhub.controller';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HttpModule,
  ],
  controllers: [FinnhubController],
  providers: [
    FinnhubService,
    StockQuoteDataGateway,
    DatabaseService,
    FinnhubService,
  ],
})
export class AppModule {}
