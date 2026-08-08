import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  imports: [PrismaModule],
  controllers: [SecurityController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class SecurityModule {}
