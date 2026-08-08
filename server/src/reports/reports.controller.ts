import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
    @Query('date') date: string
  ) {
    return this.reportsService.generateComprehensiveReport(timeframe || 'monthly', date || new Date().toISOString());
  }
}
