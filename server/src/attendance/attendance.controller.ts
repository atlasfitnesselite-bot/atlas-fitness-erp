import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { AttendanceReportsService } from './attendance-reports.service';
import {
  CheckInOutDto,
  UpdateSettingsDto,
  CreateCorrectionDto,
  UpdateCorrectionDto,
} from './dto/attendance.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { KioskGuard } from '../rbac/guards/kiosk.guard';

class SelfCheckInOutDto {
  offlineTimestamp?: string;
  location?: string;
  device?: string;
}

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceAnalyticsService: AttendanceAnalyticsService,
    private readonly attendanceReportsService: AttendanceReportsService,
  ) {}

  // --- Analytics & Reports ---

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('analytics/dashboard')
  async getDashboardAnalytics(@Query('date') date?: string) {
    return this.attendanceAnalyticsService.getDashboardAnalytics(
      date || new Date().toISOString(),
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('analytics/trend')
  async getAttendanceTrend(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 30));
    return this.attendanceAnalyticsService.getAttendanceTrend(start, end);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('payroll-ready')
  async getPayrollSummary(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceAnalyticsService.getPayrollSummary(
      parseInt(month),
      parseInt(year),
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('reports/late')
  async getLateReports(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceReportsService.getLateReports(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('reports/overtime')
  async getOvertimeReports(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceReportsService.getOvertimeReports(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('reports/break')
  async getBreakReports(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceReportsService.getBreakReports(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('timeline/:employeeId')
  async getTimeline(
    @Param('employeeId') employeeId: string,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceReportsService.getTimeline(
      employeeId,
      limit ? parseInt(limit) : undefined,
    );
  }

  // --- Kiosk Mode Actions (Publicly Accessible via PIN authentication) ---

  @UseGuards(AuthGuard('jwt'), KioskGuard)
  @Get('kiosk-employees')
  async getKioskEmployees() {
    return this.attendanceService.getKioskEmployees();
  }

  @UseGuards(AuthGuard('jwt'), KioskGuard)
  @Post('check-in')
  async checkIn(@Body() data: CheckInOutDto) {
    return this.attendanceService.checkIn(data);
  }

  @UseGuards(AuthGuard('jwt'), KioskGuard)
  @Post('check-out')
  async checkOut(@Body() data: CheckInOutDto) {
    return this.attendanceService.checkOut(data);
  }

  @UseGuards(AuthGuard('jwt'), KioskGuard)
  @Post('break-start')
  async breakStart(@Body() data: CheckInOutDto) {
    return this.attendanceService.breakStart(data);
  }

  @UseGuards(AuthGuard('jwt'), KioskGuard)
  @Post('break-end')
  async breakEnd(@Body() data: CheckInOutDto) {
    return this.attendanceService.breakEnd(data);
  }

  // --- Self-Service Attendance Actions ---
  @UseGuards(AuthGuard('jwt'))
  @Post('me/clock-in')
  async selfClockIn(
    @Req() req: { user?: { id?: string } },
    @Body() data: SelfCheckInOutDto,
  ) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.attendanceService.selfClockIn(req.user.id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/clock-out')
  async selfClockOut(
    @Req() req: { user?: { id?: string } },
    @Body() data: SelfCheckInOutDto,
  ) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.attendanceService.selfClockOut(req.user.id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/status')
  async selfStatus(@Req() req: { user?: { id?: string } }) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.attendanceService.selfStatus(req.user.id);
  }

  // --- Admin & Manager Dashboard APIs ---

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get()
  async getAttendance(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceService.getAttendanceRecords({
      search,
      departmentId,
      status,
      startDate,
      endDate,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('report/daily')
  async getDailyReport(@Query('date') date?: string) {
    return this.attendanceService.getDailyReport(date);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('report/weekly')
  async getWeeklyReport(@Query('startDate') startDate?: string) {
    return this.attendanceService.getWeeklyReport(startDate);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('report/monthly')
  async getMonthlyReport(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceService.getMonthlyReport(
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('settings')
  async getSettings() {
    return this.attendanceService.getSettings();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Put('settings')
  async updateSettings(@Body() data: UpdateSettingsDto) {
    return this.attendanceService.updateSettings(data);
  }

  // --- Corrections APIs ---

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get('corrections')
  async getCorrections(@Query('status') status?: string) {
    return this.attendanceService.getCorrections(status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('correction')
  async requestCorrection(
    @Req() req: { user?: { id?: string } },
    @Body() data: CreateCorrectionDto,
  ) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.attendanceService.createCorrection(req.user.id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Put('correction/:id')
  async handleCorrection(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
    @Body() data: UpdateCorrectionDto,
  ) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.attendanceService.handleCorrectionApproval(
      id,
      req.user.id,
      data,
    );
  }

  // --- Employee Specific Records ---

  @UseGuards(AuthGuard('jwt'))
  @Get(':employeeId')
  async getEmployeeAttendance(@Param('employeeId') employeeId: string) {
    return this.attendanceService.getEmployeeAttendance(employeeId);
  }
}
