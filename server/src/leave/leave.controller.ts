import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { LeaveService } from './leave.service';
import {
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  CreateLeaveRequestDto,
  ApproveLeaveRequestDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  AdjustLeaveBalanceDto,
} from './dto/leave.dto';

@Controller('leave')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // --- LEAVE TYPES ---
  @Get('types')
  getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  @Get('types/:id')
  getLeaveTypeById(@Param('id') id: string) {
    return this.leaveService.getLeaveTypeById(id);
  }

  @Post('types')
  @Roles('OWNER', 'MANAGER')
  createLeaveType(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveService.createLeaveType(dto);
  }

  @Put('types/:id')
  @Roles('OWNER', 'MANAGER')
  updateLeaveType(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.leaveService.updateLeaveType(id, dto);
  }

  @Delete('types/:id')
  @Roles('OWNER', 'MANAGER')
  deleteLeaveType(@Param('id') id: string) {
    return this.leaveService.deleteLeaveType(id);
  }

  // --- LEAVE BALANCES ---
  @Get('balances')
  getLeaveBalances(
    @Query('employeeId') employeeId?: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getLeaveBalances(
      employeeId,
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Post('balances/adjust')
  @Roles('OWNER', 'MANAGER')
  adjustLeaveBalance(@Body() dto: AdjustLeaveBalanceDto) {
    return this.leaveService.adjustLeaveBalance(dto);
  }

  // --- LEAVE REQUESTS ---
  @Get('requests')
  getLeaveRequests(
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.leaveService.getLeaveRequests(status, employeeId);
  }

  @Post('requests')
  createLeaveRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.createLeaveRequest(dto);
  }

  @Put('requests/:id/approve')
  @Roles('OWNER', 'MANAGER')
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() dto: ApproveLeaveRequestDto,
    @Req() req: any,
  ) {
    // Find the employee ID for the logged-in user
    const employee = await this.leaveService['prisma'].employee.findUnique({
      where: { userId: req.user.id }
    });
    
    // If the user has an associated employee record, set managerId
    if (employee) {
      dto.managerId = employee.id;
    }
    
    return this.leaveService.approveLeaveRequest(id, dto);
  }

  @Put('requests/:id/cancel')
  cancelLeaveRequest(@Param('id') id: string) {
    return this.leaveService.cancelLeaveRequest(id);
  }

  // --- HOLIDAYS ---
  @Get('holidays')
  getHolidays(@Query('year') year?: string) {
    return this.leaveService.getHolidays(year ? parseInt(year, 10) : undefined);
  }

  @Post('holidays')
  @Roles('OWNER', 'MANAGER')
  createHoliday(@Body() dto: CreateHolidayDto) {
    return this.leaveService.createHoliday(dto);
  }

  @Put('holidays/:id')
  @Roles('OWNER', 'MANAGER')
  updateHoliday(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.leaveService.updateHoliday(id, dto);
  }

  @Delete('holidays/:id')
  @Roles('OWNER', 'MANAGER')
  deleteHoliday(@Param('id') id: string) {
    return this.leaveService.deleteHoliday(id);
  }

  // --- DASHBOARD ---
  @Get('dashboard/stats')
  getDashboardStats() {
    return this.leaveService.getLeaveDashboardStats();
  }
}
