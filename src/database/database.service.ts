import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('SELECT NOW()');
      this.logger.log('✅ Connect Postgres database success!');
    } catch (error) {
      this.logger.error('❌ Conect Postgres database have error', error);
    }
  }
}
