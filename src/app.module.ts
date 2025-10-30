import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinnhubService } from './finnhub/finnhub/finnhub.service';
import { StockQuoteDataGateway } from './socket/stock-quote-data/stock-quote-data.gateway';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [AppController],
  providers: [
    AppService,
    FinnhubService,
    StockQuoteDataGateway,
    DatabaseService,
  ],
})
export class AppModule {}
