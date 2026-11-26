import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PdfService } from './pdf.service';
import { EmailService } from './email.service';
import { BillingCronService } from './billing-cron.service';
import { OldDbSyncService } from './old-db-sync.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, PdfService, EmailService, BillingCronService, OldDbSyncService],
  exports: [BillingService, PdfService, EmailService, OldDbSyncService],
})
export class BillingModule {}
