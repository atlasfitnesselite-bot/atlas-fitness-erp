import { Module } from '@nestjs/common';
import { PtController } from './pt.controller';
import { PtService } from './pt.service';
import { EmailService } from '../billing/email.service';
import { PdfService } from '../billing/pdf.service';

@Module({
  controllers: [PtController],
  providers: [PtService, EmailService, PdfService],
})
export class PtModule {}
