import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles('OWNER', 'MANAGER')
  getSalesOverview() {
    return this.reportsService.getSalesOverview();
  }

  @Get('comprehensive')
  @Roles('OWNER', 'MANAGER', 'ADMIN')
  getComprehensiveReport(
    @Query('timeframe') timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly',
    @Query('date') date: string,
  ) {
    return this.reportsService.generateComprehensiveReport(
      timeframe || 'monthly',
      date || new Date().toISOString(),
    );
  }

  @Get('auditor')
  @Roles('OWNER', 'MANAGER', 'ADMIN')
  getAuditorReport(
    @Query('timeframe') timeframe?: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAuditorReport({ timeframe, date, startDate, endDate });
  }

  @Get('auditor/export/csv')
  @Roles('OWNER', 'MANAGER', 'ADMIN')
  async exportAuditorCsv(
    @Res() res: Response,
    @Query('timeframe') timeframe?: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.reportsService.exportAuditorCsv({
      timeframe,
      date,
      startDate,
      endDate,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=CA_Auditor_GST_Report.csv');
    res.send(csv);
  }

  @Get('auditor/export/pdf')
  @Roles('OWNER', 'MANAGER', 'ADMIN')
  async exportAuditorPdf(
    @Res() res: Response,
    @Query('timeframe') timeframe?: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.reportsService.exportAuditorPdf({
      timeframe,
      date,
      startDate,
      endDate,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=CA_Auditor_GST_Report.pdf');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
