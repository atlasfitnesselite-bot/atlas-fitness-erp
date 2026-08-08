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
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { ShiftService } from './shift.service';
import {
  CreateShiftDto,
  UpdateShiftDto,
  CreateShiftAssignmentDto,
  UpdateShiftAssignmentDto,
  CreateShiftRotationDto,
  CreateShiftRequestDto,
  ApproveShiftRequestDto,
  CreateWeeklyOffDto,
  CreateShiftExceptionDto,
} from './dto/shift.dto';

@Controller('shifts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  // ─── DASHBOARD ───────────────────────────────────────────────
  @Get('dashboard')
  getDashboard() {
    return this.shiftService.getDashboard();
  }

  // ─── CALENDAR ────────────────────────────────────────────────
  @Get('calendar')
  getCalendar(@Query('year') year: string, @Query('month') month: string) {
    return this.shiftService.getCalendar(
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1,
    );
  }

  // ─── HISTORY ─────────────────────────────────────────────────
  @Get('history')
  getHistory() {
    return this.shiftService.getHistory();
  }

  // ─── SHIFT CRUD ───────────────────────────────────────────────
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.shiftService.findAll({ status, type, search });
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() dto: CreateShiftDto) {
    return this.shiftService.create(dto);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.shiftService.update(id, dto);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.shiftService.remove(id);
  }

  // ─── SHIFT ASSIGNMENTS ────────────────────────────────────────
  @Get('assignments')
  @Roles('OWNER', 'MANAGER')
  getAllAssignments() {
    return this.shiftService.getAllAssignments();
  }

  @Post('assignments')
  @Roles('OWNER', 'MANAGER')
  bulkAssign(@Body() dto: CreateShiftAssignmentDto) {
    return this.shiftService.bulkAssign(dto);
  }

  @Put('assignments/:id')
  @Roles('OWNER', 'MANAGER')
  updateAssignment(@Param('id') id: string, @Body() dto: UpdateShiftAssignmentDto) {
    return this.shiftService.updateAssignment(id, dto);
  }

  @Delete('assignments/:id')
  @Roles('OWNER', 'MANAGER')
  removeAssignment(@Param('id') id: string) {
    return this.shiftService.removeAssignment(id);
  }

  @Get('assignments/employee/:employeeId')
  getAssignmentsByEmployee(@Param('employeeId') employeeId: string) {
    return this.shiftService.getAssignmentsByEmployee(employeeId);
  }

  // ─── SHIFT ROTATIONS ─────────────────────────────────────────
  @Get('rotations')
  getRotations() {
    return this.shiftService.getRotations();
  }

  @Post('rotations')
  @Roles('OWNER', 'MANAGER')
  createRotation(@Body() dto: CreateShiftRotationDto) {
    return this.shiftService.createRotation(dto);
  }

  // ─── SHIFT REQUESTS ──────────────────────────────────────────
  @Get('requests')
  getRequests(
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
    @Request() req?: any,
  ) {
    return this.shiftService.getRequests({ status, employeeId }, req?.user);
  }

  @Post('requests')
  createRequest(
    @Body() dto: CreateShiftRequestDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.shiftService.createRequest(req.user.id, dto);
  }

  @Put('requests/:id/approve')
  @Roles('OWNER', 'MANAGER')
  approveRequest(
    @Param('id') id: string,
    @Body() dto: ApproveShiftRequestDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.shiftService.approveRequest(id, req.user.sub, dto);
  }

  @Put('requests/:id/reject')
  @Roles('OWNER', 'MANAGER')
  rejectRequest(
    @Param('id') id: string,
    @Body() dto: ApproveShiftRequestDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.shiftService.rejectRequest(id, req.user.sub, dto);
  }

  // ─── WEEKLY OFF ──────────────────────────────────────────────
  @Post('weekly-off')
  @Roles('OWNER', 'MANAGER')
  createWeeklyOff(@Body() dto: CreateWeeklyOffDto) {
    return this.shiftService.createWeeklyOff(dto);
  }

  // ─── EXCEPTIONS ──────────────────────────────────────────────
  @Post('exceptions')
  @Roles('OWNER', 'MANAGER')
  createException(@Body() dto: CreateShiftExceptionDto) {
    return this.shiftService.createException(dto);
  }

  // ─── SINGLE SHIFT BY ID (must be last to avoid catching named routes) ───
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }
}
