import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private keepAliveTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    // Keep Neon serverless PostgreSQL connection warm every 4 minutes
    this.keepAliveTimer = setInterval(() => {
      this.$queryRaw`SELECT 1`.catch(() => {
        this.$connect().catch(() => {});
      });
    }, 4 * 60 * 1000);
  }

  async onModuleDestroy() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }
    await this.$disconnect();
  }
}
