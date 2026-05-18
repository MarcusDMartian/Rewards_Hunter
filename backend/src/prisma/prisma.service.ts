// ============================================
// PRISMA SERVICE - Database connection
// ============================================

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private healthy = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.healthy = true;
      this.logger.log('Connected to database');
    } catch (error) {
      this.healthy = false;
      this.logger.error(
        'Database connection failed',
        (error as Error).stack,
      );
      // Surface failure via /health rather than crashing the process —
      // platform health checks can then route traffic away.
    }
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.warn(`Disconnect error: ${(error as Error).message}`);
    }
  }
}
