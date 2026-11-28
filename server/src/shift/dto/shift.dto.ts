import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string; // MORNING, EVENING, NIGHT, SPLIT, WEEKEND, HOLIDAY, CUSTOM

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  breakDuration?: number;

  @IsOptional()
  @IsNumber()
  gracePeriod?: number;

  @IsOptional()
  @IsNumber()
  lateThreshold?: number;

  @IsOptional()
  @IsNumber()
  earlyExitThreshold?: number;

  @IsOptional()
  @IsNumber()
  minWorkingHours?: number;

  @IsOptional()
  @IsNumber()
  maxWorkingHours?: number;

  @IsOptional()
  @IsBoolean()
  overtimeEligibility?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  breakDuration?: number;

  @IsOptional()
  @IsNumber()
  gracePeriod?: number;

  @IsOptional()
  @IsNumber()
  lateThreshold?: number;

  @IsOptional()
  @IsNumber()
  earlyExitThreshold?: number;

  @IsOptional()
  @IsNumber()
  minWorkingHours?: number;

  @IsOptional()
  @IsNumber()
  maxWorkingHours?: number;

  @IsOptional()
  @IsBoolean()
  overtimeEligibility?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateShiftAssignmentDto {
  @IsArray()
  employeeIds: string[];

  @IsString()
  shiftId: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean;
}

export class UpdateShiftAssignmentDto {
  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateShiftRotationDto {
  @IsString()
  name: string;

  @IsString()
  frequency: string;

  @IsOptional()
  @IsNumber()
  rotationCycle?: number;

  @IsString()
  startDate: string;

  @IsArray()
  employeeIds: string[];

  @IsArray()
  shiftSequence: string[];
}

export class CreateShiftRequestDto {
  @IsOptional()
  @IsString()
  requestedShiftId?: string;

  @IsOptional()
  @IsString()
  currentShiftId?: string;

  @IsString()
  targetDate: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  targetEmployeeId?: string;

  @IsString()
  reason: string;
}

export class ApproveShiftRequestDto {
  @IsOptional()
  @IsString()
  managerComment?: string;
}

export class CreateWeeklyOffDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsArray()
  days: string[];
}

export class CreateShiftExceptionDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsString()
  date: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  type?: string;
}
