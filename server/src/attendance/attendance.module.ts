import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { AttendanceReportsService } from './attendance-reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceAnalyticsService,
    AttendanceReportsService,
  ],
  exports: [
    AttendanceService,
    AttendanceAnalyticsService,
    AttendanceReportsService,
  ],
})
export class AttendanceModule {}
