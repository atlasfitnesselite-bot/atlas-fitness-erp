import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsNumber()
  maxDaysPerYear?: number;

  @IsOptional()
  @IsBoolean()
  carryForwardAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  encashmentAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateLeaveTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsNumber()
  maxDaysPerYear?: number;

  @IsOptional()
  @IsBoolean()
  carryForwardAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  encashmentAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateLeaveRequestDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsString()
  leaveTypeId: string;

  @IsString()
  fromDate: string;

  @IsString()
  toDate: string;

  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class ApproveLeaveRequestDto {
  @IsOptional()
  @IsString()
  managerId?: string;

  @IsString()
  status: string; // APPROVED, REJECTED, MODIFIED

  @IsOptional()
  @IsString()
  comments?: string;
}

export class CreateHolidayDto {
  @IsString()
  name: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateHolidayDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class AdjustLeaveBalanceDto {
  @IsString()
  employeeId: string;

  @IsString()
  leaveTypeId: string;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsNumber()
  allocated?: number;

  @IsOptional()
  @IsNumber()
  used?: number;

  @IsOptional()
  @IsNumber()
  carriedForward?: number;
}
